import {atom} from 'jotai';
import {modbusClientAtom} from './modbus-client';
import {ModbusResponse} from './modbus-frame';

export function newModbusRegisterAtom(label: string, slaveId: number, startAddress: number, quantity: number, asHex?: boolean) {
    // Atom state: { value, response, loading, error, lastSuccessTime, writing, writeError, lastWriteTime }
    // TODO handle errors inside
    const modbusAtom = atom(
        async get => {
            const client = get(modbusClientAtom);
            if (!client) {
                // TODO handle error
                return '';
            }
            try {
                const response: ModbusResponse = await client.readHoldingRegisters(slaveId, startAddress, quantity, asHex);
                if (!response.stringData) {
                    // TODO handle error
                    return '';
                }
                return response.stringData;
            } catch (err: any) {
                // TODO handle error
                return '';
            }
        },
        async (get, set, newValue: string) => {
            const client = get(modbusClientAtom);
            if (!client) throw new Error('No MODBUS client available');
            await client.writeMultipleRegisters(slaveId, startAddress, newValue);
            // Optionally, we could trigger a refresh by reading again, or just let the next read do it
        },
    );
    return modbusAtom;
}
