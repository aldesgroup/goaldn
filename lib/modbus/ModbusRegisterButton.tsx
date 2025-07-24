import {View} from 'react-native';
import {Button, Txt} from '../base';
import {useModbusWriteMultiple} from './modbus-hooks';
import {useDateFormatter} from '../utils';

export type ModbusRegisterButtonProps = {
    /** the button title */
    title: string;
    /** the slave ID of the device to read from */
    slaveId: number;
    /** the register's label */
    label: string;
    /** the register address as an int */
    addrInt: number;
    /** activates native & JS logging */
    verbose?: boolean;
    /** the value to set to the register when clicking this button */
    value: string;
    /** function to run after the changes has been done without error */
    then?: () => void;
};

export function ModbusRegisterButton({title, slaveId, label, addrInt, verbose, value, then}: ModbusRegisterButtonProps) {
    // --- shared state
    const {set, writing, writeError, lastWriteTime} = useModbusWriteMultiple(label, slaveId, addrInt);

    // --- utils
    const dateFormat = useDateFormatter(true);

    const setValue = async () => {
        const success = await set(value, verbose);
        if (success && then) {
            then();
        }
    };

    // --- view
    return (
        <View>
            <Button onPress={setValue}>{writing ? <Txt raw>Writing...</Txt> : <Txt>{title}</Txt>}</Button>
            {writeError && <Txt raw>Error: {writeError}</Txt>}
            {lastWriteTime && (
                <Txt raw className="text-secondary-foreground text-xs">
                    Write OK: {dateFormat(lastWriteTime)}
                </Txt>
            )}
        </View>
    );
}
