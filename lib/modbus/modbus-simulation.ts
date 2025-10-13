import {Mutex} from 'async-mutex';
import {atom, useAtomValue, useStore, useSetAtom} from 'jotai';
import {useEffect, useMemo} from 'react';
import Config from 'react-native-config';
import {connectedDeviceAtom} from '../bluetooth';
import {sleep} from '../utils';
import {ModbusResponse} from './modbus-frame';
import {useLogV} from '../base';

// Reactive storage for simulated registers
export const simulatedRegistersAtom = atom<{[startAddress: number]: string}>({});

export class SimulatedBleModbusClient {
    // private device: Peripheral; // does not seem like we need this
    private delay: number;
    private readonly _mutex = new Mutex();
    private store: any; // provided by React context via useStore in creator

    constructor(delay: number, store: any) {
        this.delay = delay;
        this.store = store;
    }

    // same signature as the real client
    async readHoldingRegisters(slaveId: number, startAddress: number, quantity: number, asHex?: boolean): Promise<ModbusResponse> {
        return this._mutex.runExclusive(async () => {
            // we're waiting a bit more, to emulate a little bit a real transmission
            await sleep(3 * this.delay);

            // finding the value and returning it wrapped in a ModbusResponse
            const regs = this.store.get(simulatedRegistersAtom);
            const value = regs[startAddress];
            if (value !== undefined) {
                return {slaveId, functionCode: 0x03, stringData: value, success: true};
            } else {
                throw new Error('No simulated value for register @' + startAddress);
            }
        });
    }

    // same signature as the real client
    async writeMultipleRegisters(slaveId: number, startAddress: number, quantity: number, value: string): Promise<ModbusResponse> {
        return this._mutex.runExclusive(async () => {
            // we're waiting a bit more, to emulate a little bit a real transmission
            await sleep(3 * this.delay);

            // setting the value
            this.store.set(simulatedRegistersAtom, (prev: {[startAddress: number]: string}) => ({...prev, [startAddress]: value}));

            // Return a success response
            return {slaveId, functionCode: 0x10, success: true};
        });
    }

    // used only for setting fixture data
    initSimulationData(startAddress: number, value: string | number) {
        const regs = this.store.get(simulatedRegistersAtom);
        if (!regs[startAddress]) {
            this.store.set(simulatedRegistersAtom, (prev: {[startAddress: number]: string}) => ({...prev, [startAddress]: value.toString()}));
        }
    }

    // completely reset all simulated registers
    async resetAllRegisters(): Promise<void> {
        return this._mutex.runExclusive(async () => {
            this.store.set(simulatedRegistersAtom, {});
        });
    }
}

// A global atom to hold the simulated client instance (set from React via a hook)
export const simulatedClientInstanceAtom = atom<SimulatedBleModbusClient | null>(null);

// Hook to get the simulated client with proper store access
export const useSimulatedModbusClient = () => {
    const store = useStore();
    const device = useAtomValue(connectedDeviceAtom);

    return useMemo(() => {
        if (!device) {
            return null;
        }

        const delay = !Config.BLE_DELAY_MS || Config.BLE_DELAY_MS === '' ? 50 : Number(Config.BLE_DELAY_MS);
        return new SimulatedBleModbusClient(delay, store);
    }, [device, store]);
};

// Hook to register the simulated client into the global atom so non-hook code can access it
export const useRegisterSimulatedClient = () => {
    const simulationClient = useSimulatedModbusClient();
    const setInstance = useSetAtom(simulatedClientInstanceAtom);
    const logv = useLogV('MODBUS');
    useEffect(() => {
        logv('Setting the Simulated MODBUS client');
        setInstance(simulationClient ?? null);
    }, [simulationClient, setInstance]);
};

// Hook to provide a function to initialize a register
export const useModbusSimulationValueInitializer = () => {
    const simulationClient = useSimulatedModbusClient();
    return (startAddress: number, value: string | number) => {
        simulationClient?.initSimulationData(startAddress, value);
    };
};

// Hook to reset all simulated registers (UI-friendly)
export const useResetSimulatedRegisters = () => {
    const simulationClient = useSimulatedModbusClient();
    return async () => {
        await simulationClient?.resetAllRegisters();
    };
};
