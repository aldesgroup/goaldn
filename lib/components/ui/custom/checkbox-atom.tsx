import {useAtom, useAtomValue, WritableAtom} from 'jotai';
import {Check, Minus} from 'lucide-react-native';
import {useEffect} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {getColors} from '../../../styles/theme';
import {useCheckAllAtomValues, useSetAllAtoms} from '../../../utils/atoms';
import {cn} from '../../../utils/cn';
import {smallScreenAtom} from '../../../utils/settings';
import {Txt} from './txt';

type CheckboxAtomProps<A extends WritableAtom<boolean, any, any>, B extends (WritableAtom<boolean, any, any> | undefined)[]> = {
    className?: string;
    label?: string;
    labelClassName?: string;
    labelPrepend?: boolean;
    atom: A;
    boxClassName?: string;
    associated?: B;
};

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
