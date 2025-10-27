import Slider from '@react-native-community/slider';
import {useEffect, useState} from 'react';
import {View} from 'react-native';
import {cn, Txt} from '../base';
import {Field, fieldDisplayMode, useField} from '../forms';
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
};

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
    const colors = getColors();
    const [value, setValue] = useField(field);
    const disabled = (field.disabled ? field.disabled() : false) || props.disabled;
    const visible = field.visible ? field.visible() : true;
    const minVal = field.min || 0;
    const maxVal = field.max || 1;

    // --- local state
    const [displayedValue, setDisplayedValue] = useState(value);

    // --- local state - experimental! = slider position
    const maxPct = 96.0; // we don't need to go further than that
    const minPct = 5.0 + ((value + (props.unit || '')).length - 1) * 2.2; // finger measurement of the % where to put the thumb for the min value
    const posPct = Math.ceil(minPct + ((maxPct - minPct) * (displayedValue - minVal)) / (maxVal - minVal)); // interpolating

    // --- effects
    if (field.effects) {
        // effects configured on the field
        field.effects.map(useEffect => useEffect());
    }

    useEffect(() => {
        setDisplayedValue(value);
    }, [value]);

    // --- utils

    // --- rendering
    return visible ? (
        <View className={cn('flex-col', props.className)}>
            <Txt className={cn('text-foreground mb-3', props.labelClassName)}>{props.label}</Txt>
            <View className="my-4">
                {/* The value that should follow where the thumb of the slider is! */}
                {/* The following solution "a la NativeWind" works only if:
                    safelist: [
                        ...Array.from({length: 100}, (_, i) => `w-[${i + 1}%]`)]
                    is added to the client app Tailwind config*/}
                {/* <View className={cn('items-end', `w-[${posPct}%]`)}> */}
                {/* Instead we use the vanilla solution here: */}
                <View className={cn('items-end')} style={{width: `${posPct}%`}}>
                    <View className="flex-row">
                        <Txt raw className="text-primary text-lg font-bold">
                            {displayedValue}
                        </Txt>
                        {props.unit && (
                            <Txt raw className="text-primary text-lg font-bold">
                                {props.unit}
                            </Txt>
                        )}
                    </View>
                </View>
                <Slider
                    minimumValue={field.min}
                    maximumValue={field.max}
                    step={field.step}
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.mutedForeground}
                    thumbTintColor={colors.primary}
                    disabled={disabled}
                    onSlidingComplete={val => {
                        setValue(val);
                    }}
                    onValueChange={setDisplayedValue}
                    value={value}
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
                        {field.min}
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
                        {field.max}
                    </Txt>
                </View>
            </View>
        </View>
    ) : null;
}
