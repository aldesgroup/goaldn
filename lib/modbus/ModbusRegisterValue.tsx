import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {useCallback, useEffect, useRef, useState} from 'react';
import {ActivityIndicator, TextInput, View} from 'react-native';
import {useModbusHoldingRegisters, useModbusWriteMultiple} from './modbus-hooks';
import {InputLabel, Txt} from '../base';
import {useDateFormatter} from '../utils';
import {X} from 'lucide-react-native';

export type ModbusRegisterValueProps = {
    /* the slave ID of the device to read from */
    slaveId: number;
    /* the register's label */
    label: string;
    /* the register address as an int */
    addrInt: number;
    /* the size of the data to fetch (number of registers) */
    size: number;
    /* returning the result as hexadecimal ? */
    asHex?: boolean;
    /* shall we frequently re-read the value? */
    refreshEveryMS?: number;
    /* allows to edit the value */
    editable?: boolean;
    /* activates native & JS logging */
    verbose?: boolean;
    /* an object that can be used to trigger a re-render from the parent */
    state?: any;
};

export function ModbusRegisterValue({slaveId, label, addrInt, size, asHex, refreshEveryMS, editable, verbose, state}: ModbusRegisterValueProps) {
    // --- shared state
    const {get, val, response, loading, error, lastSuccessTime} = useModbusHoldingRegisters(label, slaveId, addrInt, size, asHex);
    const {set, writing, writeError, lastWriteTime} = useModbusWriteMultiple(label, slaveId, addrInt);
    const formatDate = useDateFormatter(true);
    const [currentValue, setCurrentValue] = useState('');
    const [lastValue, setLastValue] = useState('');

    // --- local state
    const isFocused = useIsFocused();

    // --- effects

    // making sure we're reading the latest register value when putting our eyes on it
    useFocusEffect(
        useCallback(() => {
            get(verbose);
        }, [get, val, state]),
    );

    // handling the "auto-refresh" mode
    useEffect(() => {
        let interval: number;
        // Only set up the interval if the screen is focused and refreshEveryMS is provided
        if (isFocused && refreshEveryMS) {
            interval = setInterval(() => {
                get(verbose);
            }, refreshEveryMS);
        }

        // Cleanup the interval when the component unmounts OR when focus changes
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isFocused, state]); // Add isFocused and other dependencies

    // making sure the current value is in sync with the register value
    useEffect(() => {
        if (val) {
            setCurrentValue(val);
        }
    }, [val]);

    // --- utils
    // updating a value - after controlling it - when the field is editable
    const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // handling the input change, i.e. saving the register values into the device's card through MODBUS
    const handleTextChange = (newText: string) => {
        setCurrentValue(newText);

        if (newText !== '' && newText != lastValue) {
            // Clear previous debounce timeout
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }

            // Set new debounce timeout
            debounceTimeout.current = setTimeout(async () => {
                // OK for writing!
                console.log(lastValue, '->', newText);

                // writing
                const success = await set(newText, verbose);
                if (success) {
                    setLastValue(newText);
                    get(verbose);
                }
            }, 800); // Wait a bit after the user stops typing
        }
    };

    // --- view
    return (
        <View>
            {!editable ? (
                <View className="flex-row">
                    <InputLabel label={label} />
                    {loading && !refreshEveryMS ? <ActivityIndicator /> : <Txt raw> : {response && val}</Txt>}
                </View>
            ) : (
                <View className="flex-row items-center gap-2">
                    <InputLabel label={label} />
                    <TextInput value={currentValue} onChangeText={handleTextChange} className="w-16 border" />
                    {writing ? <ActivityIndicator /> : <X onPress={() => setCurrentValue('')} />}
                </View>
            )}
            {error ? (
                <View className="bg-destructive">
                    <Txt className="text-destructive-foreground">{error}</Txt>
                </View>
            ) : (
                lastSuccessTime && (
                    <Txt className="text-secondary-foreground text-xs" raw>
                        Refreshed: {formatDate(lastSuccessTime)}
                    </Txt>
                )
            )}
        </View>
    );
}
