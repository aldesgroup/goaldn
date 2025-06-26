import Slider from '@react-native-community/slider';
import {useFieldValue, useInputField} from 'form-atoms';
import {useAtomValue} from 'jotai';
import {useState} from 'react';
import {View} from 'react-native';
import {cn, Txt} from '../base';
import {FieldConfigAtom, fieldDisplayMode} from '../forms';
import {getColors} from '../styling';

/**
 * Props for the SliderField component.
 * @category Types
 */
export type SliderFieldProps<T extends FieldConfigAtom<number>> = {
    /** Additional CSS classes for the container */
    className?: string;
    /** The label text for the slider */
    label: string;
    /** Additional CSS classes for the label */
    labelClassName?: string;
    /** The field configuration atom for the slider value */
    field: T;
    /** Additional CSS classes for the slider */
    sliderClassName?: string;
    /** The unit to display with the value (e.g., "%", "px") */
    unit?: string;
    /** The display mode for the field */
    mode?: fieldDisplayMode;
};

/**
 * A form field component that renders a slider with a dynamic value display.
 * The value display follows the slider thumb position and scales based on the current value.
 *
 * @param {SliderFieldProps<confAtom>} props - The component props
 * @returns {JSX.Element} A slider field component with dynamic value display
 * @category Forms
 */
export function SliderField<confAtom extends FieldConfigAtom<number>>(props: SliderFieldProps<confAtom>) {
    // shared state
    const colors = getColors();
    const fieldConfig = useAtomValue(props.field);
    const field = useInputField(fieldConfig.fieldAtom);
    const value = useFieldValue(fieldConfig.fieldAtom);
    const disabled = fieldConfig.disabled ? fieldConfig.disabled() : false;
    const visible = fieldConfig.visible ? fieldConfig.visible() : true;
    const minVal = fieldConfig.min || 0;
    const maxVal = fieldConfig.max || 1;

    // local state
    const [displayedValue, setDisplayedValue] = useState(value);

    // experimental!
    const maxPct = 96.0; // we don't need to go further than that
    const minPct = 5.0 + ((value + (props.unit || '')).length - 1) * 2.2; // finger measurement of the % where to put the thumb for the min value
    const posPct = Math.ceil(minPct + ((maxPct - minPct) * (displayedValue - minVal)) / (maxVal - minVal)); // interpolating

    // effects
    if (fieldConfig.effects) {
        fieldConfig.effects.map(useEffect => useEffect());
    }

    // utils

    // rendering
    return (
        visible && (
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
                        minimumValue={fieldConfig.min}
                        maximumValue={fieldConfig.max}
                        step={fieldConfig.step}
                        minimumTrackTintColor={colors.primary}
                        maximumTrackTintColor={colors.mutedForeground}
                        thumbTintColor={colors.primary}
                        disabled={disabled}
                        onSlidingComplete={val => field.actions.setValue(val)}
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
                            {fieldConfig.min}
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
                            {fieldConfig.max}
                        </Txt>
                    </View>
                </View>
            </View>
        )
    );
}
