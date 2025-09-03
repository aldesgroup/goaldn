import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {useCallback, useEffect, useRef, useState, useMemo} from 'react';
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
    const {get, val, response, loading, readError, lastReadTime} = useModbusHoldingRegisters(label, slaveId, addrInt, size, asHex);
    const {set, writing, writeError, lastWriteTime} = useModbusWriteMultiple(label, slaveId, addrInt);
    const formatDate = useDateFormatter(true);
    const [currentValue, setCurrentValue] = useState('');
    const [lastValue, setLastValue] = useState('');

    // --- local state
    const isFocused = useIsFocused();

    // Memoize the response display to prevent unnecessary re-renders
    const responseDisplay = useMemo(() => {
        if (loading && !refreshEveryMS) {
            return <ActivityIndicator />;
        }
        return <Txt raw> : {response && val}</Txt>;
    }, [loading, refreshEveryMS, response, val]);

    // Memoize the last read time display
    const lastReadTimeDisplay = useMemo(() => {
        if (!lastReadTime) return null;
        return (
            <Txt className="text-secondary-foreground text-xs" raw>
                Refreshed: {formatDate(lastReadTime)}
            </Txt>
        );
    }, [lastReadTime, formatDate]);

    // --- effects

    // making sure we're reading the latest register value when putting our eyes on it
    useFocusEffect(
        useCallback(() => {
            get(verbose);
        }, [get, state]), // Removed 'val' from dependencies to prevent infinite loops
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
                    {responseDisplay}
                </View>
            ) : (
                <View className="flex-row items-center gap-2">
                    <InputLabel label={label} />
                    <TextInput value={currentValue} onChangeText={handleTextChange} className="w-16 border" />
                    {writing ? <ActivityIndicator /> : <X onPress={() => setCurrentValue('')} />}
                </View>
            )}
            {readError ? (
                <View className="bg-destructive">
                    <Txt className="text-destructive-foreground">{readError}</Txt>
                </View>
            ) : (
                lastReadTimeDisplay
            )}
        </View>
    );
}
