// ----------------------------------------------------------------------------
// Mocking a BLE device here
// ----------------------------------------------------------------------------
import {AdvertisingData, Peripheral} from 'react-native-ble-manager';
import Config from 'react-native-config';

/**
 * Mock device ID used for testing and development.
 * Format follows the standard Bluetooth MAC address format.
 * @category Bluetooth
 */
export const MOCK_DEVICE_ID = 'AL:DE:S_:DE:VI:CE';

/**
 * Mock device name, prefixed with the BLE_ID_PREFIX from config if available.
 * Used for testing and development purposes.
 * @category Bluetooth
 */
export const MOCK_DEVICE_NAME = (Config.BLE_ID_PREFIX && Config.BLE_ID_PREFIX) + 'DummyDevice';

/**
 * Flag indicating whether mock functionality is enabled.
 * Mocking is enabled in all environments except production.
 * @category Bluetooth
 */
export const isMockEnabled = Config.ENVIRONMENT !== 'production';

/**
 * Mock peripheral device object for testing and development.
 * Implements the Peripheral interface with mock data.
 * @category Bluetooth
 */
export const mockPeripheral = {
    id: MOCK_DEVICE_ID,
    name: MOCK_DEVICE_NAME,
    rssi: 0,
    advertising: {} as AdvertisingData,
} as Peripheral;
