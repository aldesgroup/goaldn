import {useCallback, useEffect, useRef, useState} from 'react';
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

// Hook that polls a holding register on an interval and exposes a reactive value
export const usePolledHoldingRegister = (
    label: string,
    slaveId: number,
    startAddress: number,
    quantity: number,
    intervalMs: number,
    asHex?: boolean,
) => {
    const {get, val, response, loading, readError, lastReadTime} = useModbusHoldingRegisters(label, slaveId, startAddress, quantity, asHex);

    const [currentValue, setCurrentValue] = useState<string | undefined>(undefined);
    const [previousVal, setPreviousVal] = useState<string | undefined>(undefined);
    const [lastChangeTime, setLastChangeTime] = useState<Date | null>(null);

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const stoppedRef = useRef<boolean>(false);

    // Sync internal state when underlying value updates
    useEffect(() => {
        if (val !== undefined && val !== currentValue) {
            setPreviousVal(currentValue);
            setCurrentValue(val);
            setLastChangeTime(new Date());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [val]);

    const clearTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    const scheduleNext = () => {
        clearTimer();
        if (stoppedRef.current) return;
        timerRef.current = setTimeout(loopOnce, intervalMs);
    };

    const loopOnce = async () => {
        if (stoppedRef.current) return;
        await get(false);
        scheduleNext();
    };

    const start = useCallback(() => {
        stoppedRef.current = false;
        clearTimer();
        // Always start immediately
        void loopOnce();
    }, [intervalMs, get]);

    const stop = useCallback(() => {
        stoppedRef.current = true;
        clearTimer();
    }, []);

    // Manage lifecycle: always enabled, start immediately
    useEffect(() => {
        start();
        return () => {
            stop();
        };
    }, [start, stop, intervalMs, slaveId, startAddress, quantity, asHex, label]);

    return {
        val: currentValue,
        previousVal,
        hasChanged: currentValue !== previousVal,
        lastChangeTime,
        response,
        loading,
        readError,
        lastReadTime,
        start,
        stop,
    };
};
