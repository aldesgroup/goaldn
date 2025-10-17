import {useAtom} from 'jotai';
import {useEffect} from 'react';
import {connectedDeviceAtom, getBleManager} from './bluetoothAtoms';
// import {SIMULATION_DEVICE_ID} from './bluetoothSimulation';

/**
 * A component that monitors Bluetooth Low Energy (BLE) connections.
 * It handles both automatic disconnection events and periodic connection checks.
 *
 * @param {Object} props - Component props
 * @param {number} [props.checkEveryMs=3000] - Interval in milliseconds for checking connection status
 * @returns {null} This component doesn't render anything
 * @category Bluetooth
 */
export function BluetoothConnectionMonitor({checkEveryMs = 3000}: {checkEveryMs?: number}) {
    // const [connectedDevice, setConnectedDevice] = useAtom(connectedDeviceAtom);
    // const bleManager = getBleManager();

    // useEffect(() => {
    //     logv('Monitoring disconnections');
    //     const subscription = bleManager.onDisconnectPeripheral(() => {
    //         logv('BLE not connected anymore!');
    //         setConnectedDevice(null);
    //     });

    //     return () => {
    //         logv('Removing BLE disconnect subscription');
    //         subscription.remove();
    //     };
    // }, []);

    // useEffect(() => {
    //     if (!connectedDevice || connectedDevice.id === SIMULATION_DEVICE_ID) return;

    //     logv('Monitoring not-connected state');
    //     const interval = setInterval(async () => {
    //         logv('checking');
    //         const stillConnected = await bleManager.isPeripheralConnected(connectedDevice.id, []);
    //         if (!stillConnected) {
    //             logv('Disconnected detected by polling!');
    //             setConnectedDevice(null);
    //         } else {
    //             logv('still connected!');
    //         }
    //     }, checkEveryMs);

    //     return () => clearInterval(interval);
    // }, [connectedDevice]);

    return null; // no UI
}
