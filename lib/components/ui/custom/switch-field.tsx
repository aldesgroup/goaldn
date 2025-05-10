import {useInputField} from 'form-atoms';
import {useAtomValue} from 'jotai';
import {View} from 'react-native';
import {cn} from '../../../utils/cn';
import {FieldConfigAtom} from '../../../utils/fields';
import {Switch} from '../switch';
import {Txt} from './txt';

type SwitchFieldProps<T extends FieldConfigAtom<boolean>> = {
    className?: string;
    label: string;
    labelClassName?: string;
    field: T;
    switchClassName?: string;
};

export function SwitchField<confAtom extends FieldConfigAtom<boolean>>(props: SwitchFieldProps<confAtom>) {
    // --- shared state
    const fieldConfig = useAtomValue(props.field);
    const field = useInputField(fieldConfig.fieldAtom);
    const disabled = fieldConfig.disabled ? fieldConfig.disabled() : false;
    const visible = fieldConfig.visible ? fieldConfig.visible() : true;

    // --- local state

    // --- effects
    if (fieldConfig.effects) {
        fieldConfig.effects.map(useEffect => useEffect());
    }

    // --- utils

    // --- rendering
    return (
        visible && (
            <View className={cn('flex-row items-center justify-between', props.className)}>
                <Txt className={cn('text-foreground', props.labelClassName)}>{props.label}</Txt>
                <Switch
                    {...props}
                    className={props.switchClassName}
                    disabled={disabled}
                    checked={field.state.value}
                    onCheckedChange={val => field.actions.setValue(val)}
                />
            </View>
        )
    );
}
