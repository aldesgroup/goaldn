import {useCallback, useEffect, useRef, useState} from 'react';
import {useLogV} from '../base';
import {getReportError, getReportWarning} from '../utils';
import {useModbusClient} from './modbus-client';
import {ModbusResponse} from './modbus-frame';
import {useModbusSimulationValueInitializer} from './modbus-simulation';
import {RegisterProps} from './modbus-utils';

// Hooks providing a function to refresh a particular register's value, this value (once asynchronously refreshed), and reading stats
export const useModbusRegisterRead = (register: RegisterProps) => {
    const {label, slaveId, startAddress, size, asHex} = register;
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
                    result = await client.readHoldingRegisters(register);
                    setResponse(result);
                    setVal(result?.stringData ?? undefined); // making the returned val reactive
                    setLastReadTime(new Date());
                    if (verbose) {
                        logv("Read value for '" + label + "': ", result.stringData);
                    }
                    return result.stringData ? result.stringData : null;
                } else {
                    setReadError('No MODBUS client available');
                    getReportError()('No MODBUS client available');
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
                getReportWarning()(err);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [slaveId, startAddress, size, asHex, client, label],
    );

    return {get, val, response, loading, readError, lastReadTime};
};

// Hooks providing a function to write to a particular register, and writing stats
export const useModbusRegisterWrite = (register: RegisterProps, verify?: boolean) => {
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
                    await client.writeMultipleRegisters(register, value);
                    setLastWriteTime(new Date());
                    if (verbose) {
                        logv(`Written value for '${register.label}' at address ${register.startAddress}: ${value}`);
                    }
                    if (verify) {
                        const result = await client.readHoldingRegisters(register);
                        return result.stringData === value;
                    }
                    return true;
                } else {
                    setWriteError('No MODBUS client available');
                    return false;
                }
            } catch (error: any) {
                setWriteError(`Write failed: ${error.message}, for register '${register.label}'`);
                getReportWarning()(error);
                return false;
            } finally {
                setWriting(false);
            }
        },
        [client, register],
    );

    return {set, writing, writeError, lastWriteTime};
};

// Hook that polls a holding register on an interval and exposes a reactive value
export const useModbusRegisterPolledRead = (register: RegisterProps, intervalMs: number, verbose?: boolean) => {
    // --- shared state
    const {get, val, response, loading, readError, lastReadTime} = useModbusRegisterRead(register);

    // --- local state
    const [currentValue, setCurrentValue] = useState<string | undefined>(undefined);
    const [previousVal, setPreviousVal] = useState<string | undefined>(undefined);
    const [lastChangeTime, setLastChangeTime] = useState<Date | null>(null);

    // --- local state (but more permanent)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const stoppedRef = useRef<boolean>(false);

    // --- utils
    const logv = useLogV('MODBUS');

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
        await get(verbose);
        scheduleNext();
    };

    const start = useCallback(() => {
        if (verbose) logv("Starting polling the value for '" + register.label + "' (" + register.startAddress + ') every ' + intervalMs + ' ms');

        stoppedRef.current = false;
        clearTimer();

        // Always start immediately
        void loopOnce();
    }, []);

    const stop = useCallback(() => {
        if (verbose) logv("Stopping polling the value for '" + register.label + "' (" + register.startAddress + ')');

        stoppedRef.current = true;
        clearTimer();
    }, []);

    // --- effects

    // Sync internal state when underlying value updates
    useEffect(() => {
        if (val !== undefined && val !== currentValue) {
            setPreviousVal(currentValue);
            setCurrentValue(val);
            setLastChangeTime(new Date());
        }
    }, [val]);

    // --- result
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

/**
 * This hook combines the 2 previous ones, for when we need to read and write a same register somewhere
 * @param reg the register we want to read from / write to
 * @param verify if true, then a reading is performed to check if the read value equals the value we've just written
 * @returns
 */
export const useModbusRegisterReadWrite = (reg: RegisterProps, verify?: boolean) => {
    // Call the two existing hooks
    const {get, val, response, loading, readError, lastReadTime} = useModbusRegisterRead(reg);
    const {set, writing, writeError, lastWriteTime} = useModbusRegisterWrite(reg, verify);

    // Return a consolidated object containing all the properties and methods
    // from both hooks.
    return {
        // Read properties and methods
        get,
        val,
        response,
        loading,
        readError,
        lastReadTime,

        // Write properties and methods
        set,
        writing,
        writeError,
        lastWriteTime,
    };
};

/**
 * Returns a setter to update the simulation register's value for a given register
 */
export const useInitSimulatedRegisterValue = () => {
    const initSimVal = useModbusSimulationValueInitializer();
    return (reg: RegisterProps, value: string | number) => initSimVal(reg.startAddress, value);
};
