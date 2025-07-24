import {Mutex} from 'async-mutex';
import {Buffer} from 'buffer';
import {atom} from 'jotai';
import {Peripheral} from 'react-native-ble-manager';
import Config from 'react-native-config';
import {connectedDeviceAtom, getBleManager} from '../bluetooth';
import {sleep} from '../utils';
import {createModbusReadingFrame, createModbusWritingFrame8bit, MODBUS_FUNCTIONS, ModbusResponse, parseModbusResponse} from './modbus-frame';
import {registerValuesToString, stringToRegisterValues} from './modbus-utils';

const bleManager = getBleManager();

export class BleModbusClient {
    private device: Peripheral;
    private timeout: number;
    private delay: number;
    private serviceUUID: string;
    private readCharacteristicUUID: string;
    private writeCharacteristicUUID: string;
    private useNotifications: boolean = false;
    private framePrefix: number | null = null;
    private readonly _mutex = new Mutex();

    constructor(
        device: Peripheral,
        timeout: number,
        delay: number,
        serviceUUID?: string,
        readCharacteristicUUID?: string,
        writeCharacteristicUUID?: string,
        useNotifications: boolean = false,
        framePrefix: number | null = null,
    ) {
        this.device = device;
        this.timeout = timeout;
        this.delay = delay;
        this.serviceUUID = serviceUUID || '';
        this.readCharacteristicUUID = readCharacteristicUUID || '';
        this.writeCharacteristicUUID = writeCharacteristicUUID || '';
        this.useNotifications = useNotifications;
        this.framePrefix = framePrefix;
    }

    async sendFrame(frame: Buffer): Promise<Buffer> {
        let frameToSend = frame;
        if (this.framePrefix !== null) {
            frameToSend = Buffer.concat([Buffer.from([this.framePrefix]), frame]);
        }
        if (this.useNotifications) {
            return this.sendFrameWithNotifications(frameToSend);
        } else {
            throw new Error('Only sending frame while expecting a notification for now');
        }
    }

    async sendFrameWithNotifications(frame: Buffer): Promise<Buffer> {
        return this._mutex.runExclusive<Buffer>(() => {
            return new Promise(async (resolve, reject) => {
                // we start waiting a bit first, before doing anything
                await sleep(this.delay);

                // setting a timeout
                const timeoutId = setTimeout(() => {
                    subscription.remove();

                    reject(new Error('MODBUS request timeout – no response received'));
                }, this.timeout);

                // preparing to capture the response through the notification mechanism
                //@ts-ignore
                const subscription = bleManager.onDidUpdateValueForCharacteristic(({characteristic, value}) => {
                    if (characteristic.toLowerCase() !== this.readCharacteristicUUID.toLowerCase()) {
                        return; // not ours
                    }

                    clearTimeout(timeoutId);
                    subscription.remove(); // ☑️  Clean‑up
                    resolve(Buffer.from(value)); // raw bytes back to caller
                });

                // writing to the given device / service / characteristic
                try {
                    await bleManager.write(this.device.id, this.serviceUUID, this.writeCharacteristicUUID, Array.from(frame));
                } catch (err) {
                    clearTimeout(timeoutId);
                    subscription.remove();
                    reject(new Error(`Failed to send request: ${err instanceof Error ? err.message : err}`));
                }
            });
        });
    }

    async readHoldingRegisters(slaveId: number, startAddress: number, quantity: number, asHex?: boolean): Promise<ModbusResponse> {
        // frame creation & sending
        const frame = createModbusReadingFrame(slaveId, startAddress, quantity);
        const functionCode = MODBUS_FUNCTIONS.READ_HOLDING_REGISTERS;
        const expectedResponse = {slaveId, functionCode, startAddress, quantity};
        const rawResponse = await this.sendFrame(frame);

        // response parsing
        const response = parseModbusResponse(rawResponse, expectedResponse, asHex);

        // from bytes to string here
        if (response.rawData) {
            response.stringData = registerValuesToString(Array.from(response.rawData), asHex);
        }

        return response;
    }

    async writeMultipleRegisters(slaveId: number, startAddress: number, value: string): Promise<ModbusResponse> {
        // from string to bytes here
        const values = value !== '' && !isNaN(Number(value)) ? stringToRegisterValues(value) : [];

        // frame creation & sending
        // const frame = createModbusWritingFrame(slaveId, startAddress, values);
        const frame = createModbusWritingFrame8bit(slaveId, startAddress, values);
        const functionCode = MODBUS_FUNCTIONS.WRITE_MULTIPLE_REGISTERS;
        const expectedResponse = {
            slaveId,
            functionCode,
            startAddress,
            // the expected number of 16-bits words
            quantity: values.length / 2,
        };

        const rawResponse = await this.sendFrame(frame);

        // response parsing
        return parseModbusResponse(rawResponse, expectedResponse);
    }
}

// accessing the MODBUS client
export const modbusClientAtom = atom(get => {
    // reacting on a device change
    const device = get(connectedDeviceAtom);
    if (!device) {
        console.log('Removing the MODBUS client');
        return null;
    }

    const timeout = !Config.BLE_TIMEOUT_MS || Config.BLE_TIMEOUT_MS === '' ? 3000 : Number(Config.BLE_TIMEOUT_MS);
    const delay = !Config.BLE_DELAY_MS || Config.BLE_DELAY_MS === '' ? 50 : Number(Config.BLE_DELAY_MS);

    // which service and characteristic to use? we can rely on the config, or try to scan the device

    let serviceUUID = Config.BLE_SERVICE_UUID;
    if (serviceUUID && serviceUUID !== '') {
        // TODO scan to find the service ID
    }

    let readCharacteristicUUID = Config.BLE_READ_CHAR_UUID;
    if (readCharacteristicUUID && readCharacteristicUUID !== '') {
        // TODO scan to find the service ID
    }

    let writeCharacteristicUUID = Config.BLE_WRITE_CHAR_UUID;
    if (writeCharacteristicUUID && writeCharacteristicUUID !== '') {
        // TODO scan to find the service ID
    }

    let useNotify = Config.BLE_USE_NOTIFY === 'true';
    let framePrefix = Config.BLE_FRAME_PREFIX === '' ? null : Number(Config.BLE_FRAME_PREFIX);

    console.log('Initialising the MODBUS client');
    return new BleModbusClient(device, timeout, delay, serviceUUID, readCharacteristicUUID, writeCharacteristicUUID, useNotify, framePrefix);
});
