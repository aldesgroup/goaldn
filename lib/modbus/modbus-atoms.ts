import {atom, useSetAtom} from 'jotai';
import {isBleDeviceSimulatedAtom} from '../bluetooth';
import {modbusClientAtom} from './modbus-client';
import {ModbusResponse} from './modbus-frame';

export function newModbusRegisterAtom(label: string, slaveId: number, startAddress: number, quantity: number, asHex?: boolean) {
    // Atom state: { value, response, loading, error, lastSuccessTime, writing, writeError, lastWriteTime }
    // TODO handle errors inside
    const modbusAtom = atom(
        // the atom's "getter"
        async get => {
            const client = get(modbusClientAtom);
            const isSimulatedDevice = get(isBleDeviceSimulatedAtom);
            const simulatedRegisters = get(simulatedRegistersAtom);
            if (isSimulatedDevice) {
                return simulatedRegisters[startAddress];
            } else if (!client) {
                // TODO handle error
                throw new Error('No MODBUS client available');
            }
            try {
                const response: ModbusResponse = await client.readHoldingRegisters(slaveId, startAddress, quantity, asHex);
                if (!response.stringData) {
                    // TODO handle error
                    throw new Error('No data present at register: ' + startAddress);
                }
                return response.stringData;
            } catch (err: any) {
                // TODO handle error
                throw new Error("Error while reading the device's information");
            }
        },
        // the atom's setter
        async (get, set, newValue: string) => {
            const client = get(modbusClientAtom);
            const isSimulatedDevice = get(isBleDeviceSimulatedAtom);
            const setSimReg = useSetAtom(simulatedRegistersAtom);
            if (isSimulatedDevice) {
                setSimReg(prev => ({...prev, startAddress: newValue}));
            } else if (!client) {
                throw new Error('No MODBUS client available');
            } else {
                await client.writeMultipleRegisters(slaveId, startAddress, newValue);
            }
            // Optionally, we could trigger a refresh by reading again, or just let the next read do it
        },
    );
    return modbusAtom;
}

/**
 * Atom to store simulated MODBUS register values.
 * The structure is: { [startAddress: number]: string }
 */
export const simulatedRegistersAtom = atom<{[startAddress: number]: string}>({});

/**
 * Returns a setter to update the simulation register's value for a given address
 */
export const useSetSimulatedRegisterValueAtAddress = () => {
    const setSimReg = useSetAtom(simulatedRegistersAtom);
    return (addrInt: number, value: string) =>
        setSimReg(prev => {
            if (prev[addrInt] === value) return prev; // No change, return previous state
            return {...prev, [addrInt]: value};
        });
};
