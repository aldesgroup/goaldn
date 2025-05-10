import {useInputField} from 'form-atoms';
import {useAtomValue} from 'jotai';
import {TouchableOpacity, View} from 'react-native';
import {cn} from '../../../utils/cn';
import {FieldConfigAtom, fieldDisplayMode, useCheckAllFormFieldValues, useFormField, useSetAllFormFields} from '../../../utils/fields';
import {Switch} from '../switch';
import {Txt} from './txt';
import {Check, Minus} from 'lucide-react-native';
import {getColors} from '../../../styles/theme';
import {useEffect} from 'react';

type CheckboxFieldProps<T extends FieldConfigAtom<boolean>> = {
    className?: string;
    label?: string;
    labelClassName?: string;
    labelPrepend?: boolean;
    field: T;
    boxClassName?: string;
    associated?: T[];
};

export function CheckboxField<confAtom extends FieldConfigAtom<boolean>>({label, labelPrepend, associated, ...props}: CheckboxFieldProps<confAtom>) {
    // --- shared state
    const colors = getColors();
    const fieldConfig = useAtomValue(props.field);
    const [value, setValue] = useFormField(props.field);
    const disabled = fieldConfig.disabled ? fieldConfig.disabled() : false;
    const visible = fieldConfig.visible ? fieldConfig.visible() : true;
    const allChecked = associated && useCheckAllFormFieldValues(associated, val => val);
    const allUnchecked = associated && useCheckAllFormFieldValues(associated, val => !val);
    const halfChecked = associated && !allChecked && !allUnchecked;
    const setAllAssociatedFields = associated && useSetAllFormFields(associated);

    // --- local state

    // --- effects
    if (fieldConfig.effects) {
        fieldConfig.effects.map(useEffect => useEffect());
    }

    useEffect(() => {
        // handling the sync: associated fields => this field
        if (associated) {
            if (allChecked) {
                setValue(true);
            } else if (allUnchecked) {
                setValue(false);
            }
        }
    }, [allChecked, allUnchecked]);

    // --- utils
    const handleCheck = () => {
        // handling the sync:  this field => associated fields
        if (value) {
            setValue(false);
            setAllAssociatedFields && setAllAssociatedFields(false);
        } else {
            setValue(true);
            setAllAssociatedFields && setAllAssociatedFields(true);
        }
    };

    // --- rendering
    return (
        visible && (
            <View className={cn('flex-row items-center gap-2', props.className)}>
                {label && labelPrepend && <Txt className={cn('text-foreground', props.labelClassName)}>{label}</Txt>}

                <TouchableOpacity
                    {...props}
                    className={cn(
                        'border-input size-5 items-center justify-center rounded border',
                        (value || halfChecked) && 'bg-primary',
                        props.boxClassName,
                    )}
                    disabled={disabled}
                    onPress={handleCheck}>
                    {halfChecked ? (
                        <Minus size={14} color={colors.primaryForeground} />
                    ) : (
                        value && <Check size={14} color={colors.primaryForeground} />
                    )}
                </TouchableOpacity>

                {label && !labelPrepend && <Txt className={cn('text-foreground', props.labelClassName)}>{label}</Txt>}
            </View>
        )
    );
}
