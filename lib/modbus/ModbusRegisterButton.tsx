import {View} from 'react-native';
import {Button, Txt} from '../base';
import {useModbusRegisterWrite} from './modbus-hooks';
import {useDateFormatter} from '../utils';
import {RegisterProps} from './modbus-utils';

export type ModbusRegisterButtonProps = {
    /** the button title */
    title: string;
    /** MODBUS register configuration */
    register: RegisterProps;
    /** activates native & JS logging */
    verbose?: boolean;
    /** the value to set to the register when clicking this button */
    value: string;
    /** function to run after the changes has been done without error */
    then?: () => void;
};

export function ModbusRegisterButton({title, register, verbose, value, then}: ModbusRegisterButtonProps) {
    // --- shared state
    const {set, writing, writeError, lastWriteTime} = useModbusRegisterWrite(register);

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
