import {Mutex} from 'async-mutex';
import {atom, useAtomValue, useStore} from 'jotai';
import {useMemo} from 'react';
import Config from 'react-native-config';
import {useLogV} from '../base';
import {connectedDeviceAtom} from '../bluetooth';
import {sleep} from '../utils';
import {ModbusResponse} from './modbus-frame';
import {RegisterProps} from './modbus-utils';

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
    async readHoldingRegisters(register: RegisterProps): Promise<ModbusResponse> {
        const {slaveId, startAddress, size, asHex} = register;
        return this._mutex.runExclusive(async () => {
            // we start waiting a bit first, before doing anything
            await sleep(this.delay);

            // finding the value and returning it wrapped in a ModbusResponse
            const regs = this.store.get(simulatedRegistersAtom);
            const value = regs[startAddress];
            if (value !== undefined) {
                await sleep(this.delay); // emulating some process time on the device's side
                return {slaveId, functionCode: 0x03, stringData: value, success: true};
            } else {
                throw new Error('No simulated value for register @' + startAddress);
            }
        });
    }

    // same signature as the real client
    async writeMultipleRegisters(register: RegisterProps, value: string): Promise<ModbusResponse> {
        const {slaveId, startAddress, size} = register;
        return this._mutex.runExclusive(async () => {
            // we start waiting a bit first, before doing anything
            await sleep(this.delay);

            // setting the value
            this.store.set(simulatedRegistersAtom, (prev: {[startAddress: number]: string}) => ({...prev, [startAddress]: value}));

            // Return a success response
            await sleep(this.delay); // emulating some process time on the device's side
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

let GLOBAL_SIMULATED_CLIENT: SimulatedBleModbusClient | null = null;

// Hook to get the simulated client with proper store access
export const useSimulatedModbusClient = () => {
    const store = useStore();
    const device = useAtomValue(connectedDeviceAtom);
    const logv = useLogV('SIMMOD');

    // Use useMemo to ensure the return value is stable across re-renders
    return useMemo(() => {
        if (!device) {
            return null;
        }

        if (!GLOBAL_SIMULATED_CLIENT) {
            logv('Initialising the SIMULATED MODBUS client');
            const delay = !Config.BLE_DELAY_MS || Config.BLE_DELAY_MS === '' ? 50 : Number(Config.BLE_DELAY_MS);
            GLOBAL_SIMULATED_CLIENT = new SimulatedBleModbusClient(delay, store);
        }

        return GLOBAL_SIMULATED_CLIENT;
    }, [device, store]);
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
