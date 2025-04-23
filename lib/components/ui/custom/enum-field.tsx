import {RESET, useFieldValue, useInputField} from 'form-atoms';
import {useAtomValue} from 'jotai';
import {X} from 'lucide-react-native';
import {Pressable, View} from 'react-native';
import {getColors} from '../../../styles/theme';
import {cn} from '../../../utils/cn';
import {FieldConfig, FieldConfigAtom, FieldConfigOption, FieldConfigOptionInfos, fieldDisplayMode} from '../../../utils/fields';
import {Txt} from './txt';

type EnumFieldProps<confAtom extends FieldConfigAtom<number>> = {
    label: string;
    labelClassName?: string;
    field: confAtom;
    valueClassName?: string;
    mode?: fieldDisplayMode;
};

type EnumValueProps = {
    option: FieldConfigOption;
    fieldConfig: FieldConfig<number>;
    className?: string;
    infos?: FieldConfigOptionInfos;
    mode?: fieldDisplayMode;
};

function EnumValue({option, fieldConfig, className, infos, mode = 'input'}: EnumValueProps) {
    // shared state
    const field = useInputField(fieldConfig.fieldAtom);
    const value = useFieldValue(fieldConfig.fieldAtom);
    const disabled = fieldConfig.disabled ? fieldConfig.disabled() : false;
    const colors = getColors();

    // local state
    const selected = value === option?.value;
    const Icon = infos?.icon;
    const iconColor = disabled ? colors.mutedForeground : colors.primary;
    const isInput = mode === 'input';

    // view
    return (
        <Pressable
            onPress={() => {
                if (isInput && !disabled) {
                    if (selected) {
                        field.actions.setValue(RESET);
                    } else {
                        field.actions.setValue(option.value);
                    }
                }
            }}>
            <View
                className={cn(
                    'bg-secondary border-border flex-row items-center gap-2 rounded-full border px-5 py-1',
                    className,
                    selected && 'bg-primary-light',
                    disabled && 'bg-muted',
                )}>
                {Icon && <Icon color={iconColor} size={18} />}
                <Txt className={cn('text-normal font-normal', disabled ? 'text-muted-foreground' : 'text-primary')}>{option.label}</Txt>
                {isInput && selected && <X color={iconColor} size={18} />}
            </View>
        </Pressable>
    );
}

function CurrentEnumValue({fieldConfig, className, mode}: {fieldConfig: FieldConfig<number>; className?: string; mode: fieldDisplayMode}) {
    // shared state
    const value = useFieldValue(fieldConfig.fieldAtom);
    const selectedValue = fieldConfig.optionsOnly ? fieldConfig.optionsOnly.some(val => val === value) && value : value;
    const option = fieldConfig.options?.find(item => item.value === selectedValue);
    const infos = option && fieldConfig.optionsInfos?.get(option.value);

    // rendering
    // return ({option ? <EnumValue fieldConfig={fieldConfig} className={className} option={option} /> : <Txt>undefined</Txt>});
    return option ? (
        <View className="flex-wrap">
            <EnumValue fieldConfig={fieldConfig} className={className} option={option} mode={mode} infos={infos} />
        </View>
    ) : (
        <Txt className="text-muted-foreground">Not entered</Txt>
    );
}

export function EnumField<confAtom extends FieldConfigAtom<number>>({mode = 'input', ...props}: EnumFieldProps<confAtom>) {
    // local state
    const isReport = mode === 'report';
    const isSheet = mode === 'sheet';
    const isInput = mode === 'input';

    // shared state
    const fieldConfig = useAtomValue(props.field);
    const visible = isReport || isSheet || (fieldConfig.visible ? fieldConfig.visible() : true);
    const mandatory = fieldConfig.mandatory && (typeof fieldConfig.mandatory === 'function' ? fieldConfig.mandatory() : fieldConfig.mandatory);

    // effects
    if (fieldConfig.effects) {
        fieldConfig.effects.map(useEffect => useEffect());
    }

    // utils

    // rendering
    return (
        visible &&
        fieldConfig.options && (
            <View className={cn('flex-col', isInput && 'gap-4', isSheet && 'gap-3', isReport && 'flex-row items-center gap-x-1 gap-y-2')}>
                {/* Label */}
                <View className="flex-row gap-1">
                    <Txt className={cn(props.labelClassName, isSheet && 'text-sm font-bold uppercase', isReport && 'text-foreground-light')}>
                        {props.label}
                    </Txt>
                    {isReport && <Txt raw>: </Txt>}
                    {mandatory && isInput && <Txt className="text-warning-foreground">(mandatory)</Txt>}
                </View>
                {/* Showing the available options */}
                {!isInput ? (
                    // Here, only showing the choosen value
                    <CurrentEnumValue fieldConfig={fieldConfig} className={props.valueClassName} mode={mode} />
                ) : (
                    <View className="flex-row flex-wrap gap-3">
                        {fieldConfig.optionsOnly
                            ? // if we restrict to some values, then we only consider those
                              fieldConfig.optionsOnly
                                  .map(value => fieldConfig.options?.find(item => item.value === value))
                                  .map(
                                      option =>
                                          option && (
                                              <EnumValue
                                                  key={option.value.toString()}
                                                  option={option}
                                                  fieldConfig={fieldConfig}
                                                  className={props.valueClassName}
                                                  infos={fieldConfig.optionsInfos?.get(option.value)}
                                              />
                                          ),
                                  )
                            : // else it's normal business, we allow to select any option
                              fieldConfig.options.map(option => (
                                  <EnumValue
                                      key={option.value.toString()}
                                      option={option}
                                      fieldConfig={fieldConfig}
                                      className={props.valueClassName}
                                      infos={fieldConfig.optionsInfos?.get(option.value)}
                                  />
                              ))}
                    </View>
                )}
            </View>
        )
    );
}
