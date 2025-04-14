import {useFieldValue, useInputField} from 'form-atoms';
import {useAtomValue} from 'jotai';
import {View} from 'react-native';
import {cn} from '../../../utils/cn';
import {FieldConfigAtom, fieldDisplayMode} from '../../../utils/fields';
import {Txt} from './txt';
import Slider from '@react-native-community/slider';
import {getColors} from '../../../styles/theme';
import {useState} from 'react';

type SliderFieldProps<T extends FieldConfigAtom<number>> = {
    className?: string;
    label: string;
    labelClassName?: string;
    field: T;
    sliderClassName?: string;
    unit?: string;
    mode?: fieldDisplayMode;
};

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
                        <Txt raw className="text-muted-foreground">
                            {fieldConfig.min}
                        </Txt>
                        {props.unit && (
                            <Txt raw className="text-muted-foreground">
                                {props.unit}
                            </Txt>
                        )}
                    </View>
                    <View className="mr-4 flex-row">
                        <Txt raw className="text-muted-foreground">
                            {fieldConfig.max}
                        </Txt>
                        {props.unit && (
                            <Txt raw className="text-muted-foreground">
                                {props.unit}
                            </Txt>
                        )}
                    </View>
                </View>
            </View>
        )
    );
}
