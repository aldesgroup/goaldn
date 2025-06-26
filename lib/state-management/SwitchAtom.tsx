import {useAtom, WritableAtom} from 'jotai';
import {View} from 'react-native';
import {cn, Txt} from '../base';
import {Switch} from '../ui/switch';

/**
 * Props for the SwitchAtom component.
 * @category Types
 */
type SwitchAtomProps<A extends WritableAtom<boolean | Promise<boolean>, any, any>> = {
    /** Additional CSS classes for the container */
    className?: string;
    /** The label text for the switch */
    label: string;
    /** Additional CSS classes for the label */
    labelClassName?: string;
    /** The writable atom to bind to */
    atom: A;
    /** Additional CSS classes for the switch */
    switchClassName?: string;
    /** Whether the switch is disabled */
    disabled?: boolean;
};
export type {SwitchAtomProps};

/**
 * A component that renders a switch input bound to a Jotai atom.
 * The switch state is controlled by the atom's value.
 *
 * @param {SwitchAtomProps<A>} props - The component props
 * @returns {JSX.Element} A switch component with label
 * @category State Management
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
