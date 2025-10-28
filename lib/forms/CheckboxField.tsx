import {Check, Minus} from 'lucide-react-native';
import {useEffect} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {cn, Txt} from '../base';
import {getColors} from '../styling';
import {Field, useCheckAllFormFieldValues, useField, useSetAllFormFields} from './fields';

/**
 * Props for the CheckboxField component.
 * @template T - The type of the field
 * @category Types
 */
export type CheckboxFieldProps<T extends Field<boolean>> = {
    /** Additional CSS classes for the container */
    className?: string;
    /** Text label for the checkbox */
    label?: string;
    /** Additional CSS classes for the label */
    labelClassName?: string;
    /** Whether to show the label before the checkbox */
    labelPrepend?: boolean;
    /** The field */
    field: T;
    /** Additional CSS classes for the checkbox box */
    boxClassName?: string;
    /** Array of associated fields for group behavior */
    associated?: T[];
    /** To disable the field */
    disabled?: boolean;
};

/**
 * A checkbox component that integrates with form-atoms for form state management.
 * Supports group behavior with associated fields and customizable styling.
 *
 * @template confAtom - The type of the field
 * @param {CheckboxFieldProps<confAtom>} props - The component props
 * @returns {JSX.Element} A checkbox component with label and optional group behavior
 * @category Forms
 */
export function CheckboxField<confAtom extends Field<boolean>>({field, label, labelPrepend, associated, ...props}: CheckboxFieldProps<confAtom>) {
    // --- shared state
    const colors = getColors();
    const [value, setValue] = useField(field);
    const disabled = (field.disabled ? field.disabled() : false) || props.disabled;
    const visible = field.visible ? field.visible() : true;
    const allChecked = associated && useCheckAllFormFieldValues(associated, val => val);
    const allUnchecked = associated && useCheckAllFormFieldValues(associated, val => !val);
    const halfChecked = associated && !allChecked && !allUnchecked;
    const setAllAssociatedFields = associated && useSetAllFormFields(associated);

    // --- local state

    // --- effects
    if (field.effects) {
        field.effects.map(useEffect => useEffect());
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
    return visible ? (
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
                {halfChecked ? <Minus size={14} color={colors.primaryForeground} /> : value && <Check size={14} color={colors.primaryForeground} />}
            </TouchableOpacity>

            {label && !labelPrepend && <Txt className={cn('text-foreground', props.labelClassName)}>{label}</Txt>}
        </View>
    ) : null;
}
