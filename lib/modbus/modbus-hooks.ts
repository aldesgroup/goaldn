import {useCallback, useState} from 'react';
import {useModbusClient} from './modbus-client';
import {ModbusResponse} from './modbus-frame';
import {useLogV} from '../base';

// Hooks providing a function to refresh a particular register's value, this value (once asynchronously refreshed), and reading stats
export const useModbusHoldingRegisters = (label: string, slaveId: number, startAddress: number, quantity: number, asHex?: boolean) => {
    const client = useModbusClient();
    const [response, setResponse] = useState<ModbusResponse | null>(null);
    const [val, setVal] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [readError, setReadError] = useState<string | null>(null);
    const [lastReadTime, setLastReadTime] = useState<Date | null>(null);
    const logv = useLogV('MODBUS');

    const get = useCallback(
        async (verbose?: boolean): Promise<string | null> => {
            setLoading(true);
            setReadError(null);

            try {
                let result: ModbusResponse;

                if (client) {
                    result = await client.readHoldingRegisters(slaveId, startAddress, quantity, asHex);
                    setResponse(result);
                    setVal(result?.stringData ?? undefined); // making the returned val reactive
                    setLastReadTime(new Date());
                    if (verbose) {
                        logv("Read value for '" + label + "': ", result.stringData);
                    }
                    return result.stringData ? result.stringData : null;
                } else {
                    setReadError('No MODBUS client available');
                    return null;
                }
            } catch (err: any) {
                // Categorize the error
                if (err.message && err.message.includes('timeout')) {
                    setReadError('Device not responding');
                } else if (err.message && err.message.includes('Exception')) {
                    setReadError(`Device error: ${err.message}`);
                } else if (err.message && err.message.includes('CRC')) {
                    setReadError('Communication error (corrupted data)');
                } else if (err.message && err.message.includes('confirmation mismatch')) {
                    setReadError('Write operation failed');
                } else {
                    setReadError(`Communication failed: ${err.message}`);
                }
                if (err.stack) logv(err.stack);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [slaveId, startAddress, quantity, asHex, client, label],
    );

    return {get, val, response, loading, readError, lastReadTime};
};

// Hooks providing a function to write to a particular register, and writing stats
export const useModbusWriteMultiple = (label: string, slaveId: number, startAddress: number, quantity: number, verify?: boolean) => {
    const client = useModbusClient();
    const [writing, setWriting] = useState(false);
    const [writeError, setWriteError] = useState<string | null>(null);
    const [lastWriteTime, setLastWriteTime] = useState<Date | null>(null);
    const logv = useLogV('MODBUS');

    const set = useCallback(
        async (value: string, verbose?: boolean) => {
            setWriting(true);
            setWriteError(null);

            try {
                if (client) {
                    await client.writeMultipleRegisters(slaveId, startAddress, quantity, value);
                    setLastWriteTime(new Date());
                    if (verbose) {
                        logv(`Written value for '${label}' at address ${startAddress}: ${value}`);
                    }
                    if (verify) {
                        const result = await client.readHoldingRegisters(slaveId, startAddress, quantity);
                        return result.stringData === value;
                    }
                    return true;
                } else {
                    setWriteError('No MODBUS client available');
                    return false;
                }
            } catch (error: any) {
                setWriteError(`Write failed: ${error.message}, for register '${label}'`);
                return false;
            } finally {
                setWriting(false);
            }
        },
        [client, startAddress, label],
    );

    return {set, writing, writeError, lastWriteTime};
};
