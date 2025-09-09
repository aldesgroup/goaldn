// ----------------------------------------------------------------------------
// Mocking a BLE device here
// ----------------------------------------------------------------------------
import {atom} from 'jotai';
import {AdvertisingData, Peripheral} from 'react-native-ble-manager';
import Config from 'react-native-config';
import {storedAtom} from '../state-management';

/**
 * Mock device ID used for testing and development.
 * Format follows the standard Bluetooth MAC address format.
 * @category Bluetooth
 */
export const SIMULATION_DEVICE_ID = 'DU:MM:YY:DE:VI:CE';

/**
 * Mock device name, prefixed with the BLE_ID_PREFIX from config if available.
 * Used for testing and development purposes.
 * @category Bluetooth
 */
export const SIMULATION_DEVICE_NAME = (Config.BLE_ID_PREFIX && Config.BLE_ID_PREFIX) + 'DummyDevice';

/**
 * Flag indicating whether mock functionality is enabled.
 * @category Bluetooth
 */
export const isSimulationBleDeviceEnabledAtom = storedAtom('simulation-ble-device-enabled', false);

/**
 * Inidicate if the currently connected device is a simulation one, rather than a real one.
 * @category Bluetooth
 */
export const isBleDeviceSimulatedAtom = atom(false);

/**
 * Mock peripheral device object for testing and development.
 * Implements the Peripheral interface with mock data.
 * @category Bluetooth
 */
export const simulationPeripheral = {
    id: SIMULATION_DEVICE_ID,
    name: SIMULATION_DEVICE_NAME,
    rssi: 0,
    advertising: {} as AdvertisingData,
} as Peripheral;
