import {useInputField} from 'form-atoms';
import {useAtomValue} from 'jotai';
import {View} from 'react-native';
import {cn, Txt} from '../base';
import {Switch} from '../ui/switch';
import {FieldConfigAtom} from './fields';

/**
 * Props for the SwitchField component.
 * @category Types
 */
export type SwitchFieldProps<T extends FieldConfigAtom<boolean>> = {
    /** Additional CSS classes for the container */
    className?: string;
    /** The label text for the switch */
    label: string;
    /** Additional CSS classes for the label */
    labelClassName?: string;
    /** The field configuration atom */
    field: T;
    /** Additional CSS classes for the switch */
    switchClassName?: string;
};

/**
 * A form field component that renders a switch input.
 * The switch state is controlled by the field configuration atom.
 *
 * @param {SwitchFieldProps<confAtom>} props - The component props
 * @returns {JSX.Element} A switch field component with label
 * @category Forms
 */
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
                <Txt className={cn('text-foreground flex-1', props.labelClassName)}>{props.label}</Txt>
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
