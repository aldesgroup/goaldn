import {useAtom, useAtomValue, WritableAtom} from 'jotai';
import {Check, Minus} from 'lucide-react-native';
import {useEffect} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {cn, Txt} from '../base';
import {smallScreenAtom} from '../settings';
import {useCheckAllAtomValues, useSetAllAtoms} from '../state-management';
import {getColors} from '../styling';

/**
 * Props for the CheckboxAtom component.
 * @template A - The type of the main checkbox atom
 * @template B - The type of the array of associated checkbox atoms
 * @category Types
 */
type CheckboxAtomProps<A extends WritableAtom<boolean, any, any>, B extends (WritableAtom<boolean, any, any> | undefined)[]> = {
    /** Additional CSS classes for the container */
    className?: string;
    /** Text label for the checkbox */
    label?: string;
    /** Additional CSS classes for the label */
    labelClassName?: string;
    /** Whether to show the label before the checkbox */
    labelPrepend?: boolean;
    /** The Jotai atom controlling the checkbox state */
    atom: A;
    /** Additional CSS classes for the checkbox box */
    boxClassName?: string;
    /** Array of associated checkbox atoms for group behavior */
    associated?: B;
};
export type {CheckboxAtomProps};

/**
 * A checkbox component that integrates with Jotai atoms for state management.
 * Supports group behavior with associated checkboxes and customizable styling.
 *
 * @template A - The type of the main checkbox atom
 * @template B - The type of the array of associated checkbox atoms
 * @param {CheckboxAtomProps<A, B>} props - The component props
 * @returns {JSX.Element} A checkbox component with label and optional group behavior
 * @category State Management
 */
export function CheckboxAtom<A extends WritableAtom<boolean, any, any>, B extends (WritableAtom<boolean, any, any> | undefined)[]>({
    label,
    labelPrepend,
    associated,
    ...props
}: CheckboxAtomProps<A, B>) {
    // --- shared state
    const colors = getColors();
    const [value, setValue] = useAtom(props.atom);
    const allChecked = associated && useCheckAllAtomValues(associated, val => !!val);
    const allUnchecked = associated && useCheckAllAtomValues(associated, val => !val);
    const halfChecked = associated && !allChecked && !allUnchecked;
    const setAllAssociatedFields = associated && useSetAllAtoms(associated);
    const smallScreen = useAtomValue(smallScreenAtom);

    // --- local state

    // --- effects
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
        <View className={cn('flex-row items-center gap-2', props.className)}>
            {label && labelPrepend && <Txt className={cn('text-foreground', props.labelClassName)}>{label}</Txt>}

            <TouchableOpacity
                {...props}
                className={cn(
                    'border-input size-5 items-center justify-center rounded border',
                    smallScreen && 'size-7',
                    (value || halfChecked) && 'bg-primary',
                    props.boxClassName,
                )}
                onPress={handleCheck}>
                {halfChecked ? <Minus size={14} color={colors.primaryForeground} /> : value && <Check size={14} color={colors.primaryForeground} />}
            </TouchableOpacity>

            {label && !labelPrepend && <Txt className={cn('text-foreground', props.labelClassName)}>{label}</Txt>}
        </View>
    );
}
