// ----------------------------------------------------------------------------
// Mocking a BLE device here
// ----------------------------------------------------------------------------
import {AdvertisingData, Peripheral} from 'react-native-ble-manager';
import Config from 'react-native-config';

/**
 * Mock device ID used for testing and development.
 * Format follows the standard Bluetooth MAC address format.
 */
export const MOCK_DEVICE_ID = 'AL:DE:S_:DE:VI:CE';

/**
 * Mock device name, prefixed with the BLE_PREFIX from config if available.
 * Used for testing and development purposes.
 */
export const MOCK_DEVICE_NAME = (Config.BLE_PREFIX && Config.BLE_PREFIX) + 'DummyDevice';

/**
 * Flag indicating whether mock functionality is enabled.
 * Mocking is enabled in all environments except production.
 */
export const isMockEnabled = Config.ENVIRONMENT !== 'production';

/**
 * Mock peripheral device object for testing and development.
 * Implements the Peripheral interface with mock data.
 */
export const mockPeripheral = {
    id: MOCK_DEVICE_ID,
    name: MOCK_DEVICE_NAME,
    rssi: 0,
    advertising: {} as AdvertisingData,
} as Peripheral;
