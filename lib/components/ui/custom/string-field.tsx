import {useFieldValue, useInputField} from 'form-atoms';
import {useAtomValue} from 'jotai';
import {View} from 'react-native';
import {cn} from '../../../utils/cn';
import {FieldConfigAtom, fieldDisplayMode, getFieldValidationError} from '../../../utils/fields';
import {useTranslator} from '../../../utils/i18n';
import {smallScreenAtom} from '../../../utils/settings';
import {Input} from '../input';
import {Txt} from './txt';
import {InputLabel, InputLabelProps} from './input-label';

type StringFieldProps<T extends FieldConfigAtom<any>, InputProps extends React.ComponentProps<typeof Input>> = {
    field: T;
    placeholder?: string;
    placeholderRaw?: boolean;
    inputClassName?: string;
    unit?: string;
} & InputLabelProps &
    InputProps;

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
    const disabled = fieldConfig.disabled ? fieldConfig.disabled() : false;
    const visible = isReport || isSheet || (fieldConfig.visible ? fieldConfig.visible() : true);
    const maxLength = fieldConfig.max || 0;
    const validError = getFieldValidationError(props.field);
    const mandatory = fieldConfig.mandatory && (typeof fieldConfig.mandatory === 'function' ? fieldConfig.mandatory() : fieldConfig.mandatory);
    const smallScreen = useAtomValue(smallScreenAtom);

    // --- effects
    if (fieldConfig.effects) {
        fieldConfig.effects.map(useEffect => useEffect());
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
            field.actions.setValue(text);
        }
    };

    const isBoolean = (val: any) => {
        return typeof val === 'boolean';
    };

    const getStringValue = (val: any) => {
        if (isBoolean(val)) {
            return val ? 'Yes' : 'No';
        }
        return val;
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
                            raw={!isBoolean(value)}
                            className={cn('text-foreground-light flex-1 text-lg', props.inputClassName)}
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
