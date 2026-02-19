import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {X} from 'lucide-react-native';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, TextInput, View} from 'react-native';
import {InputLabel, Txt} from '../base';
import {useDateFormatter} from '../utils';
import {useModbusRegisterRead, useModbusRegisterWrite} from './modbus-hooks';
import {RegisterProps} from './modbus-utils';

export type ModbusRegisterValueProps = {
    /* MODBUS register configuration */
    register: RegisterProps;
    /* shall we frequently re-read the value? */
    refreshEveryMS?: number;
    /* allows to edit the value */
    editable?: boolean;
    /* activates native & JS logging */
    verbose?: boolean;
    /* an object that can be used to trigger a re-render from the parent */
    state?: any;
};

export function ModbusRegisterValue({register, refreshEveryMS, editable, verbose, state}: ModbusRegisterValueProps) {
    // --- shared state
    const {get, val, response, loading, readError, lastReadTime} = useModbusRegisterRead(register);
    const {set, writing, writeError, lastWriteTime} = useModbusRegisterWrite(register);
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
        let interval: ReturnType<typeof setInterval> | undefined;
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
                    <InputLabel label={register.label} />
                    {responseDisplay}
                </View>
            ) : (
                <View className="flex-row items-center gap-2">
                    <InputLabel label={register.label} />
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
