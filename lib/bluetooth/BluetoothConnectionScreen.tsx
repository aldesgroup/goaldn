import {useAtom, useAtomValue, useSetAtom} from 'jotai';
import {unwrap} from 'jotai/utils';
import {Bluetooth, RefreshCcw} from 'lucide-react-native';
import {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, FlatList, TouchableOpacity, View} from 'react-native';
import {BleDisconnectPeripheralEvent, Peripheral} from 'react-native-ble-manager';
import Config from 'react-native-config';
import {Button, cn, Txt} from '../base';
import {BottomView} from '../layout';
import {useResetSimulatedRegisters} from '../modbus';
import {smallScreenAtom} from '../settings';
import {getColors} from '../styling';
import {connectedDeviceAtom, getBleManager, isBondingRequiredAtom} from './bluetoothAtoms';
import {permissionsGrantedAtom, useCheckAndRequestBlePermissions, useCheckBluetoothEnabled} from './bluetoothPermissions';
import {isBleDeviceSimulatedAtom, isSimulationBleDeviceEnabledAtom, simulationPeripherals} from './bluetoothSimulation';

/**
 * A screen component for managing Bluetooth Low Energy (BLE) device connections.
 * Handles device scanning, connection, and permission management.
 *
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object for screen navigation
 * @returns {JSX.Element} A screen component for BLE device management
 * @category Bluetooth
 */
export function BluetoothConnectionScreen({navigation}: {navigation: any}) {
    // --------------------------------------------------------------------------------------------
    // --- external, shared state
    // --------------------------------------------------------------------------------------------
    // const bleManager = useAtomValue(bleManagerAtom);
    const bleManager = getBleManager();
    const [connectedDevice, setConnectedDevice] = useAtom(connectedDeviceAtom);
    const isBondingRequired = useAtomValue(isBondingRequiredAtom);
    const setPermissionsGranted = useSetAtom(permissionsGrantedAtom);
    const colors = getColors();
    const smallScreen = useAtomValue(smallScreenAtom);
    const isSimulationBleDeviceEnabled = useAtomValue(unwrap(isSimulationBleDeviceEnabledAtom));
    const setBleDeviceSimulated = useSetAtom(isBleDeviceSimulatedAtom);
    const resetSimulatedRegisters = useResetSimulatedRegisters();
    const checkAndRequestBlePermissions = useCheckAndRequestBlePermissions();
    const checkBluetoothEnabled = useCheckBluetoothEnabled();

    // --------------------------------------------------------------------------------------------
    // internal state
    // --------------------------------------------------------------------------------------------
    const [isScanning, setIsScanning] = useState(false);
    const [connectingDevice, setConnectingDevice] = useState<string | null>(null);
    const [devices, setDevices] = useState<Peripheral[]>([]);
    const [error, setError] = useState('');
    const [permissionStatus, setPermissionStatus] = useState('checking');

    // --------------------------------------------------------------------------------------------
    // internal, but peristent, state
    // --------------------------------------------------------------------------------------------
    const isScanStarted = useRef<boolean | null>(false);

    // --------------------------------------------------------------------------------------------
    // effects
    // --------------------------------------------------------------------------------------------
    useEffect(() => {
        // This BLE manager starts operations, that we have to listen to, to handle their result
        const listeners: any[] = [
            bleManager.onDiscoverPeripheral(handleDiscoverPeripheral),
            bleManager.onConnectPeripheral(handleConnectPeripheral),
            bleManager.onDisconnectPeripheral(handleDisconnectedPeripheral),
        ];

        if (!isScanStarted.current) {
            startOrStopScan();
        }

        return () => {
            // No cleanup here - BleManager is now a singleton that persists throughout the application lifecycle
            // but at least scanning should be stopped
            if (!isScanStarted.current) {
                stopScan().then(() => {
                    console.log('Scanning has been stopped!');
                });
            }

            // stopping the listening
            for (const listener of listeners) {
                listener.remove();
            }
        };
    }, []);

    // --------------------------------------------------------------------------------------------
    // utils - handlers for the listeners
    // --------------------------------------------------------------------------------------------
    const handleDiscoverPeripheral = (peripheral: Peripheral, forceReappear?: boolean) => {
        // only considering the devices with a name
        if (peripheral.name) {
            // Add device to the list, then apply filtering and sorting
            setDevices(prevDevices => {
                // Check if device is already in the list
                const isDuplicate = prevDevices.some(d => d.id === peripheral.id);

                if (isDuplicate || (connectedDevice?.id === peripheral.id && !forceReappear)) {
                    return prevDevices;
                }

                // Create new array with the current device
                const updatedDevices = [...prevDevices, peripheral];

                // 1) Filter out devices with no name
                // 2 & 3) Sort devices - put "MyPrefix_" devices first, then sort alphabetically
                return (
                    updatedDevices
                        // .filter((d: Peripheral) => d.name) // Remove unnamed devices
                        .sort((a, b: Peripheral) => {
                            const aHasPrefix = Config.BLE_ID_PREFIX && (a.name || '').startsWith(Config.BLE_ID_PREFIX);
                            const bHasPrefix = Config.BLE_ID_PREFIX && (b.name || '').startsWith(Config.BLE_ID_PREFIX);

                            // If one has prefix and the other doesn't, prioritize the one with prefix
                            if (aHasPrefix && !bHasPrefix) return -1;
                            if (!aHasPrefix && bHasPrefix) return 1;

                            // Otherwise sort alphabetically
                            return (a.name || '').localeCompare(b.name || '');
                        })
                );
            });
        }
    };

    const handleConnectPeripheral = (event: any) => {
        console.log(`[handleConnectPeripheral][${event.peripheral}] connected.`);
    };

    const handleDisconnectedPeripheral = (event: BleDisconnectPeripheralEvent) => {
        console.debug(`[handleDisconnectedPeripheral][${event.peripheral}] disconnected.`);
    };

    // --------------------------------------------------------------------------------------------
    // utils - the rest
    // --------------------------------------------------------------------------------------------
    const checkPermissions = async () => {
        setPermissionStatus('checking');
        try {
            const granted = await checkAndRequestBlePermissions();
            setPermissionsGranted(granted);
            setPermissionStatus(granted ? 'granted' : 'denied');
            return granted;
        } catch (err) {
            if (err instanceof Error) {
                setError(`Permission error: ${err.message}`);
            } else {
                console.log('Unknown error while checking permissions:', err);
            }
            setPermissionStatus('error');
            setPermissionsGranted(false);
        }
    };

    const stopScan = async () => {
        await bleManager.stopScan();
        setIsScanning(false);
        setError('');
    };

    const quitScreen = async () => {
        await stopScan();
        navigation.goBack();
    };

    const startOrStopScan = async () => {
        try {
            const granted = await checkPermissions();
            if (!granted) {
                return;
            }

            isScanStarted.current = true;

            setError('');

            if (isScanning) {
                stopScan();
                return;
            }

            console.log('device scanning will start');

            // Check if Bluetooth is enabled (Android 12+ only)
            const isBluetoothEnabled = await checkBluetoothEnabled();
            if (!isBluetoothEnabled) {
                setError('Bluetooth is not enabled');
                return;
            }

            // Clear previous scan results
            setDevices([]);
            setIsScanning(true);

            // Scanning
            try {
                const scanDurationSeconds = 10;

                // Finding all the real devices
                bleManager.scan([], scanDurationSeconds, false);

                // Making sure we're stopping the scan at the end
                setTimeout(() => stopScan(), scanDurationSeconds * 1000);

                // Adding mock devices
                if (isSimulationBleDeviceEnabled) {
                    setTimeout(() => {
                        for (const simulationPeripheral of Object.values(simulationPeripherals)) {
                            handleDiscoverPeripheral(simulationPeripheral);
                        }
                    }, 800);
                }
            } catch (scanErr) {
                if (scanErr instanceof Error) {
                    setError(`Error while scanning for BLE devices: ${scanErr.message}`);
                } else {
                    console.log('Unknown error while scanning for BLE devices:', scanErr);
                }
                setIsScanning(false);
            }
        } finally {
            isScanStarted.current = false;
        }
    };

    const connectToDevice = async (device?: Peripheral) => {
        try {
            // First, let's reset the situation a bit
            stopScan();

            // Keeping track of the currently connected device, if any
            let lastConnectedDevice = null;

            // Resetting some stuff regarding the
            setBleDeviceSimulated(false);
            resetSimulatedRegisters();

            // Disconnecting the current device if any
            if (connectedDevice) {
                console.log('Dropping the connection to: ' + connectedDevice.id);

                // we'll probably need this
                lastConnectedDevice = connectedDevice;

                // to show something is going on
                setConnectingDevice(connectedDevice.id);

                // actually disconnecting
                if (simulationPeripherals[connectedDevice.id]) {
                    // for now, nothing special to do with the mock device
                } else {
                    // disconnecting the device
                    await bleManager.disconnect(connectedDevice.id);
                }

                // we're done
                setConnectingDevice(null);
                setConnectedDevice(null);

                // Go back to the previous screen
                navigation.goBack();
            }

            // Connecting to a new one, if any
            if (device) {
                setConnectingDevice(device.id);
                if (simulationPeripherals[device.id]) {
                    // keeping in mind we've a simulation device here
                    setBleDeviceSimulated(true);
                } else {
                    // Connect to the selected device
                    await bleManager.connect(device.id);

                    // Making its services available
                    await bleManager.retrieveServices(device.id);

                    // Bonding if necessary
                    if (isBondingRequired) {
                        // Detecting if bonding has already been done
                        const bondedPeripherals = await bleManager.getBondedPeripherals();
                        const alreadyBonded = bondedPeripherals.some(bondedDevice => bondedDevice.id === device.id);

                        // nope, let's do this
                        if (!alreadyBonded) {
                            await bleManager.createBond(device.id);
                            console.log("Bonding '" + device.name + "' successful");
                        }
                    }

                    // Starting listening for notifications, if needed
                    if (Config.BLE_USE_NOTIFY === 'true') {
                        // TODO handle the case where the service & charac IDs are not configured,
                        // but must come from scanning the available services on the device
                        if (
                            Config.BLE_SERVICE_UUID &&
                            Config.BLE_SERVICE_UUID !== '' &&
                            Config.BLE_READ_CHAR_UUID &&
                            Config.BLE_READ_CHAR_UUID !== ''
                        ) {
                            console.log('Started using BLE notifications');
                            bleManager.startNotification(device.id, Config.BLE_SERVICE_UUID, Config.BLE_READ_CHAR_UUID);
                        } else {
                            // TODO scan to find the service ID
                            throw new Error('Cannot start the BLE notifications as the service ID is unknown');
                        }
                    }
                }

                // Update connected state
                setConnectedDevice(device);

                // Go back to the previous screen
                navigation.goBack();
            }

            // we've just disconnected, which should make our device disappear;
            // so we're cheating here and doing as if we've just re-discovered our old device
            if (lastConnectedDevice) {
                handleDiscoverPeripheral(lastConnectedDevice, true);
            }

            return true;
        } catch (connErr) {
            if (connErr instanceof Error) {
                setError(`Error while connecting to a BLE device: ${connErr.message}`);
            } else {
                // console.log("Unknown error while connecting to a BLE device:", connErr);
                setError('Unknown error while connecting to a BLE device:' + connErr);
            }
            setConnectedDevice(null);
            return false;
        } finally {
            setConnectingDevice(null);
        }
    };

    /**
     * Props for the device item component in the device list.
     * @property {Peripheral} item - The BLE peripheral device to display
     */
    interface deviceItemProps {
        item: Peripheral;
    }

    /**
     * Renders a single device item in the device list.
     * @param {deviceItemProps} props - The device item props
     * @returns {JSX.Element} A touchable device item component
     */
    const RenderDeviceItem = ({item}: deviceItemProps) => {
        const device = item;
        const isDeviceConnected = (connectedDevice && connectedDevice.id === device.id) || false;

        return (
            <View
                className={cn(
                    'bg-secondary mb-4 rounded-xl p-4',
                    // when not wrapped
                    !smallScreen && 'flex-row justify-between',
                    // when wrapped
                    smallScreen && 'flex-col gap-2',
                )}>
                {/* Device infos */}
                <View className="flex-row items-center gap-4">
                    <Bluetooth color={colors.secondaryForeground} size={24} />
                    <View className="">
                        <Txt raw className="">
                            {device.name || 'Unnamed Device'}
                        </Txt>
                        <Txt raw className={cn('text-sm')}>
                            {device.id}
                        </Txt>
                    </View>
                </View>

                {/* Button */}
                <View className={cn('flex-row justify-end', !smallScreen && 'flex-1')}>
                    <TouchableOpacity
                        className={cn('rounded-lg px-4 py-2', isDeviceConnected ? 'bg-info-foreground' : 'bg-primary')}
                        onPress={() => (isDeviceConnected ? connectToDevice() : connectToDevice(device))}>
                        {connectingDevice === device.id ? (
                            <View>
                                <Txt className="font-medium text-white">{isDeviceConnected ? 'Disconnecting...' : 'Connecting...'}</Txt>
                                <ActivityIndicator size="small" color="white" />
                            </View>
                        ) : (
                            <Txt className="font-medium text-white">{isDeviceConnected ? 'Disconnect' : 'Connect'}</Txt>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // TODO handle error... cf. theo3.gg... neverthrow.. ?
    return (
        <BottomView headerTitle="Connect a Bluetooth device" onClose={quitScreen} h={smallScreen ? 'h-5/6' : 'h-2/3'}>
            {/* Displaying error messages */}
            {/* TODO rather integrate a more generic way of dealing for errors */}
            {error && (
                <View className="mb-4 rounded-lg bg-red-100 p-3">
                    <Txt className="text-red-800">{error}</Txt>
                </View>
            )}

            {permissionStatus === 'denied' && (
                <TouchableOpacity className="mb-4 rounded-lg bg-yellow-100 p-3" onPress={checkPermissions}>
                    <Txt className="text-yellow-800">Bluetooth permissions required. Tap to grant permissions.</Txt>
                </TouchableOpacity>
            )}

            {/* Displaying the currently connected device on top */}
            {connectedDevice && <RenderDeviceItem item={connectedDevice} />}

            {/* Showing each found bluetooth device */}
            <View className="flex-1">
                <FlatList data={Object.values(devices)} keyExtractor={item => item.id} renderItem={RenderDeviceItem} />
            </View>

            {/* Actions */}
            <View className="flex-row justify-between">
                <Button variant="secondary" onPress={() => quitScreen()}>
                    <Txt>Cancel</Txt>
                </Button>
                <Button variant="secondary" onPress={startOrStopScan} disabled={permissionStatus === 'checking'}>
                    {isScanning ? (
                        <View className="flex-row items-center gap-4">
                            {!smallScreen && <Txt>Scanning...</Txt>}
                            <ActivityIndicator size="small" color={colors.secondaryForeground} />
                        </View>
                    ) : (
                        <View className="flex-row items-center gap-4">
                            <Txt>Scan</Txt>
                            <RefreshCcw size={16} color={colors.secondaryForeground} />
                        </View>
                    )}
                </Button>
            </View>
        </BottomView>
    );
}
