// ----------------------------------------------------------------------------
// Mocking a BLE device here
// ----------------------------------------------------------------------------
import {AdvertisingData, Peripheral} from 'react-native-ble-manager';
import Config from 'react-native-config';

export const MOCK_DEVICE_ID = 'AL:DE:S_:DE:VI:CE';
export const MOCK_DEVICE_NAME = (Config.BLE_PREFIX && Config.BLE_PREFIX) + 'DummyDevice';
export const isMockEnabled = Config.ENVIRONMENT !== 'production';
export const mockPeripheral = {
    id: MOCK_DEVICE_ID,
    name: MOCK_DEVICE_NAME,
    rssi: 0,
    advertising: {} as AdvertisingData,
} as Peripheral;
