import {atom, useAtomValue, useSetAtom} from 'jotai';
import {useCallback, useState} from 'react';
import {modbusClientAtom} from './modbus-client';
import {ModbusResponse} from './modbus-frame';
import {isBleDeviceSimulatedAtom} from '../bluetooth/bluetoothSimulation';
import {simulatedRegistersAtom} from './modbus-atoms';

/**
 * Returns a function that must be used in order to populate the "response" object that's also returned here.
 * @param slaveId
 * @param startAddress
 * @param quantity
 * @param asHex
 * @returns
 */
export const useModbusHoldingRegisters = (label: string, slaveId: number, startAddress: number, quantity: number, asHex?: boolean) => {
    const client = useAtomValue(modbusClientAtom);
    const isSimulatedDevice = useAtomValue(isBleDeviceSimulatedAtom);
    const simulatedRegisters = useAtomValue(simulatedRegistersAtom);
    const [response, setResponse] = useState<ModbusResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastSuccessTime, setLastSuccessTime] = useState<Date | null>(null);

    const get = useCallback(
        async (verbose?: boolean) => {
            setLoading(true);
            setError(null);

            try {
                if (isSimulatedDevice) {
                    const value = simulatedRegisters[startAddress];
                    console.log('values:', simulatedRegisters);
                    if (value !== undefined) {
                        setResponse({slaveId, functionCode: 0x03, stringData: value, success: true});
                        setLastSuccessTime(new Date());
                    } else {
                        setError('No simulated value for this register');
                    }
                } else if (client) {
                    const result = await client.readHoldingRegisters(slaveId, startAddress, quantity, asHex);
                    setResponse(result);
                    setLastSuccessTime(new Date());
                    if (verbose) {
                        console.log("Read value for '" + label + "': ", result.stringData);
                    }
                } else {
                    throw new Error('No MODBUS client available');
                }
            } catch (err: any) {
                // Categorize the error
                if (err.message && err.message.includes('timeout')) {
                    setError('Device not responding');
                } else if (err.message && err.message.includes('Exception')) {
                    setError(`Device error: ${err.message}`);
                } else if (err.message && err.message.includes('CRC')) {
                    setError('Communication error (corrupted data)');
                } else if (err.message && err.message.includes('confirmation mismatch')) {
                    setError('Write operation failed');
                } else {
                    setError(`Communication failed: ${err.message}`);
                }
                if (err.stack) console.log(err.stack);
            } finally {
                setLoading(false);
            }
        },
        [slaveId, startAddress, quantity, client, isSimulatedDevice, simulatedRegisters],
    );

    return {get, val: response?.stringData, response, loading, error, lastSuccessTime};
};

export const useModbusWriteMultiple = (label: string, slaveId: number, startAddress: number) => {
    const client = useAtomValue(modbusClientAtom);
    const isSimulatedDevice = useAtomValue(isBleDeviceSimulatedAtom);
    const setSimReg = useSetAtom(simulatedRegistersAtom);
    const [writing, setWriting] = useState(false);
    const [writeError, setWriteError] = useState<string | null>(null);
    const [lastWriteTime, setLastWriteTime] = useState<Date | null>(null);

    const set = useCallback(
        async (value: string, verbose?: boolean) => {
            setWriting(true);
            setWriteError(null);

            try {
                if (isSimulatedDevice) {
                    setSimReg(prev => ({...prev, startAddress: value}));
                    setLastWriteTime(new Date());
                    if (verbose) {
                        console.log(`[SIM] Written value for '${label}' at address ${startAddress}: ${value}`);
                    }
                    return true;
                } else if (client) {
                    await client.writeMultipleRegisters(slaveId, startAddress, value);
                    setLastWriteTime(new Date());
                    if (verbose) {
                        console.log(`Written value for '${label}' at address ${startAddress}: ${value}`);
                    }
                    return true;
                } else {
                    throw new Error('No MODBUS client available');
                }
            } catch (error: any) {
                setWriteError(`Write failed: ${error.message}, for register '${label}'`);
                return false;
            } finally {
                setWriting(false);
            }
        },
        [client, isSimulatedDevice, setSimReg, startAddress, label],
    );

    return {set, writing, writeError, lastWriteTime};
};
