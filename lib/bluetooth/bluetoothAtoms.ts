// atoms.js - Jotai atoms for BLE state management
import {atom} from 'jotai';
import BleManager, {Peripheral} from 'react-native-ble-manager';

// Create a singleton instance of BleManager that persists across component lifecycles
let started = false;

/**
 * Gets or initializes the singleton instance of BleManager.
 * Ensures BleManager is started only once and returns the same instance throughout the app.
 * @returns {typeof BleManager} The BleManager instance.
 * @category Bluetooth
 */
export const getBleManager = () => {
    if (!started) {
        BleManager.start();
        started = true;
    }

    return BleManager;
};

/**
 * Jotai atom storing the BleManager instance.
 * Initialized with the singleton instance from getBleManager().
 * @category Bluetooth
 */
export const bleManagerAtom = atom<typeof BleManager>(getBleManager());

/**
 * Jotai atom storing the currently connected Bluetooth peripheral device.
 * Initialized as null when no device is connected.
 * @category Bluetooth
 */
export const connectedDeviceAtom = atom<Peripheral | null>(null);

/**
 * Jotai atom indicating whether bonding (pairing) is required for the current connection.
 * Used to control the bonding flow in the UI.
 * @category Bluetooth
 */
export const isBondingRequiredAtom = atom(false);
