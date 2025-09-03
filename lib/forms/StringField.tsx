import {useFieldValue, useInputField} from 'form-atoms';
import {useAtomValue} from 'jotai';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {cn, InputLabel, InputLabelProps, Txt} from '../base';
import {FieldConfigAtom, getFieldValidationError, useFieldLastModified} from '../forms';
import {smallScreenAtom, useTranslator} from '../settings';
import {RefreshableAtom, useRefreshableAtom} from '../state-management';
import {Input} from '../ui/input';

/**
 * Props for the StringField component.
 * Extends InputLabelProps and InputProps with additional string-specific properties.
 * @category Types
 */
export type StringFieldProps<T extends FieldConfigAtom<any>, InputProps extends React.ComponentProps<typeof Input>> = {
    /** The field configuration atom */
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
    /** Should the field value be synchronized with the value of another atom? */
    syncWith?: RefreshableAtom<Promise<string>, string>;
} & InputLabelProps &
    InputProps;

/**
 * A form field component that renders a string input with validation and error handling.
 * Supports different display modes (input, sheet, report) and handles various value types.
 *
 * @param {StringFieldProps<confAtom, InputProps>} props - The component props
 * @returns {JSX.Element} A string input field with label, validation, and optional unit
 * @category Forms
 */
export function StringField<confAtom extends FieldConfigAtom<any>, InputProps extends React.ComponentProps<typeof Input>>({
    mode = 'input',
    ...props
}: StringFieldProps<confAtom, InputProps>) {
    // --- local state
    const isReport = mode === 'report';
    const isSheet = mode === 'sheet';
    const isInput = mode === 'input';

    // --- shared state
    const fieldConfig = useAtomValue(props.field);
    const field = useInputField(fieldConfig.fieldAtom);
    const value = useFieldValue(fieldConfig.fieldAtom);
    const [lastModified, setLastModified] = useFieldLastModified(fieldConfig.stateAtom);
    const disabled = fieldConfig.disabled ? fieldConfig.disabled() : false;
    const visible = isReport || isSheet || (fieldConfig.visible ? fieldConfig.visible() : true);
    const maxLength = fieldConfig.max || 0;
    const validError = getFieldValidationError(props.field);
    const mandatory = fieldConfig.mandatory && (typeof fieldConfig.mandatory === 'function' ? fieldConfig.mandatory() : fieldConfig.mandatory);
    const smallScreen = useAtomValue(smallScreenAtom);

    // --- shared state - syncing with another atom
    const syncAtom = (props.syncWith ?? fieldConfig.syncWith) as RefreshableAtom<Promise<string>, string> | undefined;
    const [syncedVal, syncedValLastModified, refreshSyncedVal, _setSyncedVal] = syncAtom
        ? useRefreshableAtom<Promise<string>, string>(syncAtom)
        : [undefined, undefined, undefined, undefined];

    // --- effects
    if (fieldConfig.effects) {
        // effects configured on the field
        fieldConfig.effects.map(useEffect => useEffect());
    }

    // refreshing the synced value, if any
    useEffect(() => {
        if (refreshSyncedVal) refreshSyncedVal();
    }, []);

    // if the synced value has changed & is more recent, we set it
    useEffect(() => {
        // there is a synced value, and it's different from the local value
        if (syncedVal && syncedVal !== value) {
            // if there is no last modified date, or the synced value is more recent, we set it
            if (!lastModified || syncedValLastModified > lastModified) {
                field.actions.setValue(syncedVal);
                setLastModified(new Date());
            }
        }
    }, [syncedVal]);

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
            field.actions.setValue(text);
            setLastModified(new Date());
        }
    };

    const isBoolean = (val: any) => {
        return typeof val === 'boolean';
    };

    const getStringValue = (val: any) => {
        return isBoolean(val) ? (val ? 'Yes' : 'No') : val;
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
    return (
        visible && (
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
                            {...props}
                            className={cn(
                                'border-border text-foreground',
                                value ? 'bg-secondary' : 'bg-white',
                                props.inputClassName,
                                validError && 'text-destructive-foreground border-destructive-foreground',
                                smallScreen && 'min-h-16',
                            )}
                            editable={!disabled}
                            value={value}
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
        )
    );
}
