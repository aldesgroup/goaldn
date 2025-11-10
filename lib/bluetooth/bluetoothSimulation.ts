// ----------------------------------------------------------------------------
// Mocking BLE devices here
// ----------------------------------------------------------------------------
import {atom} from 'jotai';
import {AdvertisingData, Peripheral} from 'react-native-ble-manager';
import Config from 'react-native-config';
import {storedAtom} from '../state-management';

/**
 * Mock device name, prefixed with the BLE_ID_PREFIX from config if available.
 * Used for testing and development purposes.
 * @category Bluetooth
 */
const SIMULATION_DEVICE_NAME_PFX = `Dummy`;

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
 * If the config item BLE_SIMULATION_DEVICES has been specified, in this form:
 * deviceId1:deviceName1|deviceId2:deviceName2|deviceId3:deviceName3|etc,
 * then this is the array containing the simulation peripherals, mapped by there ID
 * @category Bluetooth
 */
export const simulationPeripherals: {[key: string]: Peripheral} = (
    Config.BLE_SIMULATION_DEVICES ? Config.BLE_SIMULATION_DEVICES.split('|') : []
).reduce(
    (obj, deviceString) => {
        const [id, name] = deviceString.split(':');
        if (id && name) {
            obj[id] = {
                id: id,
                name: SIMULATION_DEVICE_NAME_PFX + name,
                rssi: 0,
                advertising: {} as AdvertisingData,
            };
        }
        return obj;
    },
    {} as {[key: string]: Peripheral},
);
