import {useAtom, useAtomValue, WritableAtom} from 'jotai';
import {View} from 'react-native';
import {cn} from '../../../utils/cn';
import {smallScreenAtom} from '../../../utils/settings';
import {Switch} from '../switch';
import {Txt} from './txt';

type SwitchAtomProps<A extends WritableAtom<boolean | Promise<boolean>, any, any>> = {
    className?: string;
    label: string;
    labelClassName?: string;
    atom: A;
    switchClassName?: string;
    disabled?: boolean;
};

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
