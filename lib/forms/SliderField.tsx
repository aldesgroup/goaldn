import Slider from '@react-native-community/slider';
import {useState} from 'react';
import {View} from 'react-native';
import {cn, Txt} from '../base';
import {Field, fieldDisplayMode, useField} from '../carots';
import {getColors} from '../styling';

/**
 * Props for the SliderField component.
 * @category Types
 */
export type SliderFieldProps<T extends Field<number>> = {
    /** Additional CSS classes for the container */
    className?: string;
    /** The label text for the slider */
    label: string;
    /** Additional CSS classes for the label */
    labelClassName?: string;
    /** The field for the slider value */
    field: T;
    /** Additional CSS classes for the slider */
    sliderClassName?: string;
    /** The unit to display with the value (e.g., "%", "px") */
    unit?: string;
    /** The display mode for the field */
    mode?: fieldDisplayMode;
    /** To disable the field */
    disabled?: boolean;
    /** Custom steps can be used to change the label shown on each step. For example, `[{value: 30, label: '30min'}, {value: 60, label: '1h'}]` */
    customSteps?: {value: number; label: string}[];
};

function CurrentStep({stepMarked, label}: {stepMarked: boolean; label: string}) {
    if (!stepMarked) return null;

    return (
        <View className="bottom-8">
            <Txt raw className="text-lg font-bold text-primary">
                {label}
            </Txt>
        </View>
    );
}

/**
 * A form field component that renders a slider with a dynamic value display.
 * The value display follows the slider thumb position and scales based on the current value.
 *
 * @param {SliderFieldProps<confAtom>} props - The component props
 * @returns {JSX.Element} A slider field component with dynamic value display
 * @category Forms
 */
export function SliderField<T extends Field<number>>({field, ...props}: SliderFieldProps<T>) {
    // shared state
    const [fieldValue, setFieldValue] = useField(field);

    // --- local state
    const customSteps = props.customSteps;
    const [value, setValue] = useState(customSteps ? customSteps.findIndex(step => step.value === fieldValue) : fieldValue);

    const label = `${customSteps ? customSteps[value].label : value}${props.unit || ''}`;
    const disabled = (field.disabled ? field.disabled() : false) || props.disabled;
    const visible = field.visible ? field.visible() : true;
    const step = props.customSteps ? 1 : field.step || 1;
    const min = customSteps ? 0 : field.min || 0;
    const max = customSteps ? customSteps.length - 1 : field.max || 1;
    const minLabel = customSteps ? customSteps[0].label : min;
    const maxLabel = customSteps ? customSteps[customSteps.length - 1].label : max;
    const colors = getColors();

    const handleSlidingComplete = (v: number) => setFieldValue(customSteps ? customSteps[v].value : v);

    // --- effects
    if (field.effects) {
        // effects configured on the field
        field.effects.map(useEffect => useEffect());
    }

    // --- rendering
    if (!visible) return null;

    return (
        <View className={cn('flex-col', props.className)}>
            <Txt className={cn('mb-7 text-foreground', props.labelClassName)}>{props.label}</Txt>
            <View className="my-4">
                <Slider
                    minimumValue={min}
                    maximumValue={max}
                    step={step}
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.mutedForeground}
                    thumbTintColor={colors.primary}
                    disabled={disabled}
                    onSlidingComplete={handleSlidingComplete}
                    onValueChange={setValue}
                    value={value}
                    StepMarker={({stepMarked}) => <CurrentStep stepMarked={stepMarked} label={label} />}
                />
            </View>
            <View className="flex-row justify-between">
                <View className="ml-4 flex-row">
                    <Txt
                        raw
                        className="text-muted-foreground"
                        append={
                            props.unit && (
                                <Txt raw className="text-muted-foreground">
                                    {props.unit}
                                </Txt>
                            )
                        }>
                        {minLabel}
                    </Txt>
                </View>
                <View className="mr-4 flex-row">
                    <Txt
                        raw
                        className="text-muted-foreground"
                        append={
                            props.unit && (
                                <Txt raw className="text-muted-foreground">
                                    {props.unit}
                                </Txt>
                            )
                        }>
                        {maxLabel}
                    </Txt>
                </View>
            </View>
        </View>
    );
}
