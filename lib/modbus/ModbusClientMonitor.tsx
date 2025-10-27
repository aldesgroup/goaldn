import {useNavigation} from '@react-navigation/native';
import {useAtom, useAtomValue} from 'jotai';
import {useEffect, useRef, useState} from 'react';
import Config from 'react-native-config';
import {useLogV} from '../base';
import {connectedDeviceAtom, getBleManager, isBleDeviceSimulatedAtom} from '../bluetooth';
import {useModbusRegisterRead} from './modbus-hooks';
import {RegisterProps} from './modbus-utils';

type ModbusClientMonitorProps = {
    register: RegisterProps;
    checkEveryMs?: number;
    failureThreshold?: number;
    navToWhenFail: string;
};

/**
 * ModbusClientMonitor mounts at the application root and periodically reads a
 * holding register to detect communication/connectivity issues with the MODBUS
 * client (typically over Bluetooth). It increments a counter on each failed
 * read; once the number of consecutive failures reaches the threshold, it will:
 *
 * - Disconnect the currently connected BLE peripheral (errors ignored)
 * - Navigate to the provided route name to let the UI handle reconnection
 *
 * The component renders nothing.
 *
 * @param register MODBUS register configuration.
 * @param checkEveryMs Polling interval in milliseconds. Defaults to 3000 ms.
 * @param failureThreshold Number of consecutive failures before triggering the
 * disconnect and navigation. Defaults to 3.
 * @param navToWhenFail React Navigation route name to navigate to when the
 * threshold is reached.
 * @returns null
 * @category Modbus
 * @example
 * ```tsx
 * <ModbusClientMonitor
 *   register={{
 *     label: "heartbeat",
 *     slaveId: 1,
 *     startAddress: 0,
 *     quantity: 1
 *   }}
 *   checkEveryMs={3000}
 *   failureThreshold={3}
 *   navToWhenFail="Invite to reconnect"
 * />
 * ```
 */
export function ModbusClientMonitor(props: ModbusClientMonitorProps) {
    // --- shared state
    const connectedDevice = useAtomValue(connectedDeviceAtom);

    // --- "view"
    return connectedDevice ? <InnerModbusClientMonitor {...props} /> : null;
}

function InnerModbusClientMonitor({register, checkEveryMs = 3000, failureThreshold = 10, navToWhenFail}: ModbusClientMonitorProps) {
    // --- shared state - BLE / device
    const bleManager = getBleManager();
    const [connectedDevice, setConnectedDevice] = useAtom(connectedDeviceAtom);
    const isBleDeviceSimulated = useAtomValue(isBleDeviceSimulatedAtom);

    // --- shared state - MODBUS
    const {get: readRegister} = useModbusRegisterRead(register);

    // --- shared state - misc
    const navigation = useNavigation<any>();
    const verbose = Config.ENVIRONMENT === 'development';

    // --- local state
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [consecutiveFailures, setConsecutiveFailures] = useState(0);
    const handledRef = useRef(false);

    // --- utils
    const logv = useLogV('MODBUS');

    const clearTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    const loopOnce = async () => {
        let failedAgain = true;
        try {
            const res = await readRegister(verbose);
            if (res !== null) {
                if (consecutiveFailures !== 0) {
                    setConsecutiveFailures(0);
                }
                failedAgain = false;
            } else {
                setConsecutiveFailures(prev => prev + 1);
            }
        } catch {
            setConsecutiveFailures(prev => prev + 1);
        } finally {
            // if the calls start failing, we start checking more often
            timerRef.current = setTimeout(loopOnce, failedAgain ? 1000 : checkEveryMs);
        }
    };

    // --- effects

    // starting the checks
    useEffect(() => {
        logv(`ModbusClientMonitor: starting polling every ${checkEveryMs} ms`);
        handledRef.current = false;
        clearTimer();
        timerRef.current = setTimeout(loopOnce, checkEveryMs);
        return () => {
            clearTimer();
        };
    }, [register, checkEveryMs, connectedDevice]);

    // reacting to too many failures
    useEffect(() => {
        if (consecutiveFailures >= failureThreshold && !handledRef.current) {
            handledRef.current = true;
            (async () => {
                try {
                    logv(`ModbusClientMonitor: failure threshold reached (${consecutiveFailures}).`);
                    logv(`Connected device? `, connectedDevice?.id);
                    clearTimer();

                    // Disconnect BLE device if connected
                    if (connectedDevice) {
                        try {
                            if (!isBleDeviceSimulated) {
                                await bleManager.disconnect(connectedDevice.id);
                            }
                            setConnectedDevice(null);
                            logv(`Disconnected, and now navigating to '${navToWhenFail}'.`);
                        } catch (err) {
                            logv('Caught error while disconnecting:', err);
                        }
                    }
                } finally {
                    // Navigate regardless
                    navigation.navigate(navToWhenFail);
                }
            })();
        }
    }, [consecutiveFailures]);

    // no UI
    return null;
}
