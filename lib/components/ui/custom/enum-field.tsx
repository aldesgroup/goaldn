import {RESET, useFieldValue, useInputField} from 'form-atoms';
import {useAtomValue} from 'jotai';
import {X} from 'lucide-react-native';
import {Pressable, View} from 'react-native';
import {getColors} from '../../../styles/theme';
import {cn} from '../../../utils/cn';
import {FieldConfig, FieldConfigAtom, FieldConfigOption, FieldConfigOptionInfos, fieldDisplayMode} from '../../../utils/fields';
import {smallScreenAtom} from '../../../utils/settings';
import {InputLabel, InputLabelProps} from './input-label';
import {Txt} from './txt';

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
                    'border-border bg-secondary flex-row items-center gap-2 rounded-full border px-5 py-1',
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

function CurrentEnumValue({
    fieldConfig,
    className,
    mode,
    emptyValueLabel,
}: {
    fieldConfig: FieldConfig<number>;
    className?: string;
    mode: fieldDisplayMode;
    emptyValueLabel: string;
}) {
    // shared state
    const value = useFieldValue(fieldConfig.fieldAtom);
    const selectedValue = fieldConfig.optionsOnly ? fieldConfig.optionsOnly.some(val => val === value) && value : value;
    const option = fieldConfig.options?.find(item => item.value === selectedValue);
    const infos = option && fieldConfig.optionsInfos?.get(option.value);

    // rendering
    return option ? (
        <View className="flex-wrap">
            <EnumValue fieldConfig={fieldConfig} className={className} option={option} mode={mode} infos={infos} />
        </View>
    ) : (
        <Txt className="text-muted-foreground">{emptyValueLabel}</Txt>
    );
}

type EnumFieldProps<confAtom extends FieldConfigAtom<number>> = {
    field: confAtom;
    valueClassName?: string;
    emptyValueLabel?: string;
} & InputLabelProps;

export function EnumField<confAtom extends FieldConfigAtom<number>>({
    mode = 'input',
    emptyValueLabel = 'Not entered',
    ...props
}: EnumFieldProps<confAtom>) {
    // --- local state
    const isReport = mode === 'report';
    const isSheet = mode === 'sheet';
    const isInput = mode === 'input';

    // --- shared state
    const fieldConfig = useAtomValue(props.field);
    const visible = isReport || isSheet || (fieldConfig.visible ? fieldConfig.visible() : true);
    const mandatory = fieldConfig.mandatory && (typeof fieldConfig.mandatory === 'function' ? fieldConfig.mandatory() : fieldConfig.mandatory);
    const smallScreen = useAtomValue(smallScreenAtom);

    // --- effects
    if (fieldConfig.effects) {
        fieldConfig.effects.map(useEffect => useEffect());
    }

    // --- utils

    // --- rendering
    return (
        visible &&
        fieldConfig.options && (
            <View
                className={cn(
                    'flex-col',
                    isInput && 'gap-4',
                    isSheet && 'gap-3',
                    isReport && !smallScreen && 'flex-row items-center gap-x-1 gap-y-2',
                )}>
                {/* Label */}
                <InputLabel
                    label={props.label}
                    labelClassName={props.labelClassName}
                    mode={mode}
                    mandatory={mandatory}
                    labelAppend={props.labelAppend}
                />

                {/* Showing the available options */}
                {!isInput ? (
                    // Here, only showing the choosen value
                    <CurrentEnumValue fieldConfig={fieldConfig} className={props.valueClassName} mode={mode} emptyValueLabel={emptyValueLabel} />
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
