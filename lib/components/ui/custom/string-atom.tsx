import {useAtom, useAtomValue, WritableAtom} from 'jotai';
import React from 'react';
import {View} from 'react-native';
import {cn} from '../../../utils/cn';
import {useTranslator} from '../../../utils/i18n';
import {smallScreenAtom} from '../../../utils/settings';
import {Input} from '../input';
import {InputLabel, InputLabelProps} from './input-label';
import {Txt} from './txt';

/**
 * Props for the StringAtom component.
 * Extends InputLabelProps and InputProps with additional string-specific properties.
 * @property {A} atom - The writable atom to bind to
 * @property {string} [placeholder] - The placeholder text for the input
 * @property {boolean} [placeholderRaw] - Whether to use raw (untranslated) placeholder text
 * @property {string} [inputClassName] - Additional CSS classes for the input
 * @property {string} [unit] - Text to display after the value (not translated)
 * @property {boolean} [clearDefault] - If true, clears the value if it matches GOALD_DEFAULT_STRING
 */
type StringAtomProps<A extends WritableAtom<any | Promise<any>, any, any>, InputProps extends React.ComponentProps<typeof Input>> = {
    atom: A;
    placeholder?: string;
    placeholderRaw?: boolean;
    inputClassName?: string;
    unit?: string;
    clearDefault?: boolean;
} & InputLabelProps &
    InputProps;

/**
 * A component that renders a string input field bound to a Jotai atom.
 * Supports different display modes (input, sheet, report) and handles various value types.
 *
 * @param {StringAtomProps<A, InputProps>} props - The component props
 * @returns {JSX.Element} A string input component with label and optional unit
 */
export function StringAtom<A extends WritableAtom<any | Promise<any>, any, any>, InputProps extends React.ComponentProps<typeof Input>>({
    mode = 'input',
    mandatory,
    ...props
}: StringAtomProps<A, InputProps>) {
    // shared state
    const [value, setValue] = useAtom(props.atom);
    const smallScreen = useAtomValue(smallScreenAtom);

    // local state
    const isReport = mode === 'report';
    const isSheet = mode === 'sheet';
    const isInput = mode === 'input';

    // effects

    // utils
    let placeholder = props.placeholder;
    if (props.placeholder && !props.placeholderRaw) {
        const translate = useTranslator();
        const {translation} = translate(props.placeholder);
        placeholder = translation;
    }

    const updateValue = (text: string) => {
        // setting the value, but not allowing to exceed the configured maxlength, if there's one
        setValue(text);
    };

    const isBoolean = (val: any) => {
        return typeof val === 'boolean';
    };

    const isNumber = (val: any) => {
        return typeof val === 'number';
    };

    const getStringValue = (val: any) => {
        if (isBoolean(val)) {
            return val ? 'Yes' : 'No';
        }
        if (isNumber(val)) {
            return String(val);
        }
        return val;
    };

    // rendering
    return (
        <View
            className={cn(
                'flex-col gap-2',
                props.className,
                (isReport || props.sideValue) && 'flex-row items-center',
                props.sideValue && 'justify-between',
            )}>
            {/* Label */}
            <InputLabel
                label={props.label}
                labelClassName={cn(props.labelClassName)}
                mode={mode}
                mandatory={mandatory}
                labelAppend={props.labelAppend}
                sideValue={props.sideValue}
            />

            {/* Input field */}
            {!isInput ? (
                // No input in report mode
                <View className="flex-row items-end">
                    <Txt raw={!isBoolean(value)} className="text-foreground-light text-lg">
                        {getStringValue(value)}
                    </Txt>
                    {props.unit && (
                        <Txt raw className="text-foreground-light text-lg">
                            {props.unit}
                        </Txt>
                    )}
                </View>
            ) : (
                // Now we're talking
                <>
                    <Input
                        {...props}
                        className={cn(
                            'border-border text-foreground min-w-14',
                            value ? 'bg-secondary' : 'bg-white',
                            props.inputClassName,
                            smallScreen && 'min-h-16',
                        )}
                        value={getStringValue(value)}
                        placeholder={placeholder} // making sure to put it after the ...props, to override them
                        onChangeText={updateValue}
                    />
                </>
            )}
        </View>
    );
}
