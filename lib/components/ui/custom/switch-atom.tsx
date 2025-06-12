import {useAtom, useAtomValue, WritableAtom} from 'jotai';
import {View} from 'react-native';
import {cn} from '../../../utils/cn';
import {smallScreenAtom} from '../../../utils/settings';
import {Switch} from '../switch';
import {Txt} from './txt';

/**
 * Props for the SwitchAtom component.
 * @property {string} [className] - Additional CSS classes for the container
 * @property {string} label - The label text for the switch
 * @property {string} [labelClassName] - Additional CSS classes for the label
 * @property {A} atom - The writable atom to bind to
 * @property {string} [switchClassName] - Additional CSS classes for the switch
 * @property {boolean} [disabled] - Whether the switch is disabled
 */
type SwitchAtomProps<A extends WritableAtom<boolean | Promise<boolean>, any, any>> = {
    className?: string;
    label: string;
    labelClassName?: string;
    atom: A;
    switchClassName?: string;
    disabled?: boolean;
};

/**
 * A component that renders a switch input bound to a Jotai atom.
 * The switch state is controlled by the atom's value.
 *
 * @param {SwitchAtomProps<A>} props - The component props
 * @returns {JSX.Element} A switch component with label
 */
export function SwitchAtom<A extends WritableAtom<boolean | Promise<boolean>, any, any>>(props: SwitchAtomProps<A>) {
    // --- shared state
    const [value, setValue] = useAtom(props.atom);

    // --- local state

    // --- effects

    // --- utils

    // --- rendering
    return (
        <View className={cn('flex-row items-center justify-between gap-2', props.className)}>
            <Txt className={cn('text-foreground', 'flex-1', props.labelClassName)}>{props.label}</Txt>
            <Switch
                {...props}
                className={cn(props.switchClassName)}
                checked={value}
                onCheckedChange={val => setValue(val)}
                disabled={props.disabled}
            />
        </View>
    );
}
