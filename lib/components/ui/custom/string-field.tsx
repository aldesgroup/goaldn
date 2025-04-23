import {useFieldValue, useInputField} from 'form-atoms';
import {useAtomValue} from 'jotai';
import {View} from 'react-native';
import {cn} from '../../../utils/cn';
import {FieldConfigAtom, fieldDisplayMode, getFieldValidationError} from '../../../utils/fields';
import {useTranslator} from '../../../utils/i18n';
import {Input} from '../input';
import {Txt} from './txt';

type StringFieldProps<T extends FieldConfigAtom<any>, InputProps extends React.ComponentProps<typeof Input>> = {
    label: string;
    labelClassName?: string;
    field: T;
    placeholder?: string;
    placeholderRaw?: boolean;
    inputClassName?: string;
    mode?: fieldDisplayMode;
    unit?: string;
} & InputProps;

export function StringField<confAtom extends FieldConfigAtom<any>, InputProps extends React.ComponentProps<typeof Input>>({
    mode = 'input',
    ...props
}: StringFieldProps<confAtom, InputProps>) {
    // local state
    const isReport = mode === 'report';
    const isSheet = mode === 'sheet';
    const isInput = mode === 'input';

    // shared state
    const fieldConfig = useAtomValue(props.field);
    const field = useInputField(fieldConfig.fieldAtom);
    const value = useFieldValue(fieldConfig.fieldAtom);
    const disabled = fieldConfig.disabled ? fieldConfig.disabled() : false;
    const visible = isReport || isSheet || (fieldConfig.visible ? fieldConfig.visible() : true);
    const maxLength = fieldConfig.max || 0;
    const validError = getFieldValidationError(props.field);
    const mandatory = fieldConfig.mandatory && (typeof fieldConfig.mandatory === 'function' ? fieldConfig.mandatory() : fieldConfig.mandatory);

    // effects
    if (fieldConfig.effects) {
        fieldConfig.effects.map(useEffect => useEffect());
    }

    // utils
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

    // rendering
    return (
        visible && (
            <View className={cn('flex-col gap-2', props.className, isReport && 'flex-row items-center')}>
                {/* Label */}
                <View className="flex-row gap-1">
                    <Txt
                        className={cn(
                            props.labelClassName,
                            validError && 'text-destructive-foreground',
                            isSheet && 'text-sm font-bold uppercase',
                            isReport && 'text-foreground-light',
                        )}>
                        {props.label}
                    </Txt>
                    {isReport && <Txt raw>: </Txt>}
                    {mandatory && isInput && <Txt className="text-warning-foreground">(mandatory)</Txt>}
                </View>
                {/* Input field */}
                {!isInput ? (
                    // No input in report mode
                    <View className="flex-row items-center">
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
                                'border-border text-foreground',
                                value ? 'bg-secondary' : 'bg-white',
                                props.inputClassName,
                                validError && 'text-destructive-foreground border-destructive-foreground',
                            )}
                            editable={!disabled}
                            value={value}
                            placeholder={placeholder} // making sure to put it after the ...props, to override them
                            onChangeText={updateValue}
                        />
                        {validError && (
                            <View className="flex-row gap-1">
                                <Txt className="text-destructive-foreground">{validError.msg}</Txt>
                                {validError.param && (
                                    <Txt className="text-destructive-foreground" raw>
                                        ({validError.param})
                                    </Txt>
                                )}
                            </View>
                        )}
                    </>
                )}
            </View>
        )
    );
}
