import {atom} from 'jotai';
import {atomWithRefresh} from 'jotai/utils';
import {isBleDeviceSimulatedAtom} from '../bluetooth';
import {RefreshableAtom} from '../state-management';
import {realModbusClientAtom} from './modbus-client';
import {ModbusResponse} from './modbus-frame';
import {simulatedClientInstanceAtom} from './modbus-simulation';

// cf. https://jotai.org/docs/utilities/resettable#atomwithrefresh
// Passing zero arguments to set will refresh. Passing one or more arguments to set will call "write" function.

export function newModbusRegisterAtom(
    label: string,
    slaveId: number,
    startAddress: number,
    quantity: number,
    asHex?: boolean,
): RefreshableAtom<Promise<string>, string> {
    // TODO handle errors inside

    // Private state for this register atom instance
    let lastValue: string | undefined;
    let lastChangedAt: Date | undefined;

    // This is the read-only atom that handles the refresh logic.
    const modbusReadAtom = atomWithRefresh(async get => {
        // --- shared data
        const isSimulated = get(isBleDeviceSimulatedAtom);
        const realClient = get(realModbusClientAtom);
        const simulatedClient = get(simulatedClientInstanceAtom);

        // --- local state
        let nextValue: string | undefined;

        // --- getting the next value
        if (isSimulated) {
            if (!simulatedClient) throw new Error('No simulated MODBUS client available');
            const response: ModbusResponse = await simulatedClient.readHoldingRegisters(slaveId, startAddress, quantity, asHex);
            if (!response.stringData) {
                throw new Error('No data present at register: ' + startAddress);
            } else {
                console.log("Read value for '" + startAddress + "' (" + label + '): ', response.stringData);
            }
            nextValue = response.stringData;
        } else {
            if (!realClient) {
                throw new Error('No MODBUS client available');
            }
            try {
                const response: ModbusResponse = await realClient.readHoldingRegisters(slaveId, startAddress, quantity, asHex);
                if (!response.stringData) {
                    throw new Error('No data present at register: ' + startAddress);
                } else {
                    console.log("Read value for '" + startAddress + "': ", response.stringData);
                }
                nextValue = response.stringData;
            } catch (err: any) {
                throw new Error("Error while reading the device's information");
            }
        }

        // --- error handling
        if (nextValue === undefined) {
            throw new Error('No data present at register: ' + startAddress);
        }

        // update internal change tracking only when the value actually changes
        if (lastValue !== nextValue) {
            lastValue = nextValue;
            lastChangedAt = new Date();
        }

        // Return value with lastModified
        return {
            value: nextValue,
            lastModified: lastChangedAt ?? new Date(),
        };
    });

    // This is the writable atom that allows both writing and refreshing.
    const modbusReadWriteAtom = atom(
        // --- read
        get => get(modbusReadAtom),

        // --- write
        async (get, set, newValue?: string) => {
            if (newValue !== undefined) {
                const isSimulated = get(isBleDeviceSimulatedAtom);
                const realClient = get(realModbusClientAtom);
                const simulatedClient = get(simulatedClientInstanceAtom);

                if (isSimulated) {
                    if (!simulatedClient) {
                        throw new Error('No simulated MODBUS client available');
                    }
                    await simulatedClient.writeMultipleRegisters(slaveId, startAddress, newValue);
                    // Optimistically update and conditionally refresh
                    const changed = lastValue !== newValue;
                    if (changed) {
                        lastValue = newValue;
                        lastChangedAt = new Date();
                        set(modbusReadAtom);
                    }
                } else {
                    if (!realClient) {
                        throw new Error('No MODBUS client available');
                    }
                    await realClient.writeMultipleRegisters(slaveId, startAddress, newValue);
                    // Optimistically update and conditionally refresh
                    const changed = lastValue !== newValue;
                    if (changed) {
                        lastValue = newValue;
                        lastChangedAt = new Date();
                        set(modbusReadAtom);
                    }
                }
            } else {
                // Manual refresh request
                set(modbusReadAtom);
            }
        },
    );

    return modbusReadWriteAtom;
}
