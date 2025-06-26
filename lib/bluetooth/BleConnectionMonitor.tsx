import {useAtom} from 'jotai';
import {useEffect} from 'react';
import {connectedDeviceAtom, getBleManager} from './bluetoothAtoms';
import {MOCK_DEVICE_ID} from './bluetoothMocking';

/**
 * A component that monitors Bluetooth Low Energy (BLE) connections.
 * It handles both automatic disconnection events and periodic connection checks.
 *
 * @param {Object} props - Component props
 * @param {number} [props.checkEveryMs=3000] - Interval in milliseconds for checking connection status
 * @returns {null} This component doesn't render anything
 * @category Bluetooth
 */
export function BLEConnectionMonitor({checkEveryMs = 3000}: {checkEveryMs?: number}) {
    const [connectedDevice, setConnectedDevice] = useAtom(connectedDeviceAtom);
    const bleManager = getBleManager();

    useEffect(() => {
        console.log('Monitoring disconnections');
        const subscription = bleManager.onDisconnectPeripheral(() => {
            console.log('BLE not connected anymore!');
            setConnectedDevice(null);
        });

        return () => {
            console.log('Removing BLE disconnect subscription');
            subscription.remove();
        };
    }, []);

    useEffect(() => {
        if (!connectedDevice || connectedDevice.id === MOCK_DEVICE_ID) return;

        console.log('Monitoring not-connected state');
        const interval = setInterval(async () => {
            console.log('checking');
            const stillConnected = await bleManager.isPeripheralConnected(connectedDevice.id, []);
            if (!stillConnected) {
                console.log('Disconnected detected by polling!');
                setConnectedDevice(null);
            } else {
                console.log('still connected!');
            }
        }, checkEveryMs);

        return () => clearInterval(interval);
    }, [connectedDevice]);

    return null; // no UI
}
