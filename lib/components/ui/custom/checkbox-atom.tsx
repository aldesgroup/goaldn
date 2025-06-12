import {useAtom, useAtomValue, WritableAtom} from 'jotai';
import {Check, Minus} from 'lucide-react-native';
import {useEffect} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {getColors} from '../../../styles/theme';
import {useCheckAllAtomValues, useSetAllAtoms} from '../../../utils/atoms';
import {cn} from '../../../utils/cn';
import {smallScreenAtom} from '../../../utils/settings';
import {Txt} from './txt';

/**
 * Props for the CheckboxAtom component.
 * @template A - The type of the main checkbox atom
 * @template B - The type of the array of associated checkbox atoms
 * @property {string} [className] - Additional CSS classes for the container
 * @property {string} [label] - Text label for the checkbox
 * @property {string} [labelClassName] - Additional CSS classes for the label
 * @property {boolean} [labelPrepend] - Whether to show the label before the checkbox
 * @property {A} atom - The Jotai atom controlling the checkbox state
 * @property {string} [boxClassName] - Additional CSS classes for the checkbox box
 * @property {B} [associated] - Array of associated checkbox atoms for group behavior
 */
type CheckboxAtomProps<A extends WritableAtom<boolean, any, any>, B extends (WritableAtom<boolean, any, any> | undefined)[]> = {
    className?: string;
    label?: string;
    labelClassName?: string;
    labelPrepend?: boolean;
    atom: A;
    boxClassName?: string;
    associated?: B;
};

/**
 * A checkbox component that integrates with Jotai atoms for state management.
 * Supports group behavior with associated checkboxes and customizable styling.
 *
 * @template A - The type of the main checkbox atom
 * @template B - The type of the array of associated checkbox atoms
 * @param {CheckboxAtomProps<A, B>} props - The component props
 * @returns {JSX.Element} A checkbox component with label and optional group behavior
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
