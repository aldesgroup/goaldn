import {useAtomValue} from 'jotai';
import React from 'react';
import {View} from 'react-native';
import {cn, InputLabel, InputLabelProps, Txt} from '../base';
import {Field, useField, useFieldValidationError} from '../forms';
import {smallScreenAtom, useTranslator} from '../settings';
import {Input} from '../ui/input';

/**
 * Props for the StringField component.
 * Extends InputLabelProps and InputProps with additional string-specific properties.
 * @category Types
 */
export type StringFieldProps<T extends Field<any>, InputProps extends React.ComponentProps<typeof Input>> = {
    /** The field */
    field: T;
    /** The placeholder text for the input */
    placeholder?: string;
    /** Whether to use raw (untranslated) placeholder text */
    placeholderRaw?: boolean;
    /** Additional CSS classes for the whole component */
    className?: string;
    /** Additional CSS classes for the input */
    inputClassName?: string;
    /** Text to display after the value (not translated) */
    unit?: string;
    /** Should the field value be translated, when it's read-only? */
    translateValue?: boolean;
    /** To disable the field */
    disabled?: boolean;
    /** Set type to 'number' to enable the numeric keyboard and the number validation (natural numbers only) */
    type?: 'number';
} & InputLabelProps &
    InputProps;

/**
 * A form field component that renders a string input with validation and error handling.
 * Supports different display modes (input, sheet, report) and handles various value types.
 *
 * @param {StringFieldProps<T, InputProps>} props - The component props
 * @returns {JSX.Element} A string input field with label, validation, and optional unit
 * @category Forms
 */
export function StringField<T extends Field<any>, InputProps extends React.ComponentProps<typeof Input>>({
    field,
    mode = 'input',
    ...props
}: StringFieldProps<T, InputProps>) {
    // --- local state
    const isReport = mode === 'report';
    const isSheet = mode === 'sheet';
    const isInput = mode === 'input';

    // --- shared state
    const [value, setValue] = useField(field);
    const disabled = (field.disabled ? field.disabled() : false) || props.disabled;
    const visible = isReport || isSheet || (field.visible ? field.visible() : true);
    const maxLength = field.max || 0;
    const validError = useFieldValidationError(field);
    const mandatory = field.mandatory && (typeof field.mandatory === 'function' ? field.mandatory() : field.mandatory);
    const smallScreen = useAtomValue(smallScreenAtom);

    // --- effects
    if (field.effects) {
        // effects configured on the field
        field.effects.map(useEffect => useEffect());
    }

    // --- utils
    let placeholder = props.placeholder;
    if (!props.placeholderRaw) {
        const translate = useTranslator();
        const {translation} = translate(props.placeholder);
        placeholder = translation;
    }

    const updateValue = (text: string) => {
        // setting the value, but not allowing to exceed the configured maxlength, if there's one
        if (maxLength === 0 || text.length <= maxLength) {
            if (props.type === 'number') {
                const numberString = text.replace(/[^0-9]/g, '');
                const number = Number(numberString);
                setValue(numberString === '' || Number.isNaN(number) ? null : number);
            } else {
                setValue(text);
            }
        }
    };

    const isBoolean = (val: any) => {
        return typeof val === 'boolean';
    };

    const getStringValue = (val: any) => {
        return isBoolean(val) ? (val ? 'Yes' : 'No') : String(val ?? '');
    };

    const ErrorAppend = () => {
        return (
            <>
                {validError && validError.param && (
                    <Txt className="text-destructive-foreground" raw prepend=" ">
                        ({validError.param})
                    </Txt>
                )}
            </>
        );
    };

    // --- rendering
    return visible ? (
        <View className={cn('flex-col gap-2', props.className, isReport && !smallScreen && 'flex-row items-center')}>
            {/* Label */}
            <InputLabel
                label={props.label}
                labelClassName={cn(validError && 'text-destructive-foreground', props.labelClassName)}
                mode={mode}
                mandatory={mandatory}
                labelAppend={props.labelAppend}
            />

            {/* Input field */}
            {!isInput ? (
                // No input in report mode
                <View className="flex-row items-center">
                    <Txt
                        raw={!isBoolean(value) && !props.translateValue}
                        className={cn('text-foreground-light text-lg', props.inputClassName)}
                        append={
                            props.unit && (
                                <Txt raw className={cn('text-foreground-light flex-1 text-lg', props.inputClassName)}>
                                    {props.unit}
                                </Txt>
                            )
                        }>
                        {getStringValue(value)}
                    </Txt>
                </View>
            ) : (
                // Now we're talking
                <>
                    <Input
                        keyboardType={props.type === 'number' ? 'numeric' : 'default'}
                        {...props}
                        className={cn(
                            'border-border text-foreground',
                            value ? 'bg-secondary' : 'bg-white',
                            props.inputClassName,
                            validError && 'border-destructive-foreground text-destructive-foreground',
                            smallScreen && 'min-h-16',
                        )}
                        editable={!disabled}
                        value={getStringValue(value)}
                        placeholder={placeholder} // making sure to put it after the ...props, to override them
                        onChangeText={updateValue}
                    />
                    {validError && (
                        <View className="flex-row gap-1">
                            <Txt className="text-destructive-foreground flex-1" append={<ErrorAppend />}>
                                {validError.msg}
                            </Txt>
                        </View>
                    )}
                </>
            )}
        </View>
    ) : null;
}
