import {RESET} from 'form-atoms';
import {useAtomValue} from 'jotai';
import {X} from 'lucide-react-native';
import {Pressable, View} from 'react-native';
import {cn, InputLabel, InputLabelProps, Txt} from '../base';
import {smallScreenAtom} from '../settings';
import {getColors} from '../styling';
import {Field, fieldDisplayMode, FieldOption, FieldOptionInfos, useField, useFieldMeta, useFieldValue} from './fields';

/**
 * Props for the EnumFieldValue component.
 * @property {FieldOption} option - The enum option to display
 * @property {Field<number>} field - The field configuration
 * @property {string} [className] - Additional CSS classes for the value container
 * @property {FieldOptionInfos} [infos] - Additional information for the option
 * @property {fieldDisplayMode} [mode] - The display mode of the component
 * @property {boolean} [disabledValue] - Should this value be disabled?
 * @property {(val: number | typeof RESET) => void} [onChange] - Optional action performed on value change
 * @category Types
 */
type EnumFieldValueProps = {
    option: FieldOption;
    field: Field<number>;
    className?: string;
    infos?: FieldOptionInfos;
    mode?: fieldDisplayMode;
    disabledValue?: boolean;
    onChange?: (val: number | typeof RESET) => void;
};
export type {EnumFieldValueProps};

/**
 * A component that renders a single enum option value.
 * Handles selection state and user interaction.
 *
 * @param {EnumFieldValueProps} props - The component props
 * @returns {JSX.Element} A pressable badge showing the enum option
 * @category Forms
 */
function EnumFieldValue({option, field, className, infos, mode = 'input', disabledValue, onChange}: EnumFieldValueProps) {
    // shared state
    const [value, setValue] = useField(field);
    const disabled = (field.disabled ? field.disabled() : false) || disabledValue;
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
                        setValue(RESET);
                        onChange && onChange(RESET);
                    } else {
                        setValue(option.value);
                        onChange && onChange(option.value);
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

/**
 * A component that displays the currently selected enum value.
 * Shows a placeholder when no value is selected.
 *
 * @param {Object} props - The component props
 * @param {Field<number>} props.field - The field configuration
 * @param {string} [props.className] - Additional CSS classes for the value container
 * @param {fieldDisplayMode} props.mode - The display mode of the component
 * @param {string} props.emptyValueLabel - Text to show when no value is selected
 * @property {boolean} [disabledValue] - Should this value be disabled?
 * @returns {JSX.Element} A view showing the current selection or placeholder
 * @category Forms
 */
function CurrentEnumFieldValue({
    field,
    className,
    mode,
    emptyValueLabel,
    disabledValue,
    useSyncedVal,
}: {
    field: Field<number>;
    className?: string;
    mode: fieldDisplayMode;
    emptyValueLabel: string;
    disabledValue?: boolean;
    useSyncedVal?: boolean;
}) {
    // shared state
    const fieldValue = useFieldValue(field);
    const [{lastSyncedVal}] = useFieldMeta(field);
    const value = useSyncedVal && lastSyncedVal ? lastSyncedVal : fieldValue;
    const selectedValue = field.optionsOnly ? field.optionsOnly.some(val => val === value) && value : value;
    const option = field.options?.find(item => item.value === selectedValue);
    const infos = option && field.optionsInfos?.get(option.value);

    // rendering
    return option ? (
        <View className="flex-wrap">
            <EnumFieldValue field={field} className={className} option={option} mode={mode} infos={infos} disabledValue={disabledValue} />
        </View>
    ) : (
        <Txt className="text-muted-foreground">{emptyValueLabel}</Txt>
    );
}

/**
 * Props for the EnumField component.
 * @template <Textarea:cols></Textarea:cols> - The type of the field
 * @category Types
 */
type EnumFieldProps<T extends Field<number>> = {
    /** The field */
    field: T;
    /** Additional CSS classes for the value containers */
    valueClassName?: string;
    /** Text to show when no value is selected */
    emptyValueLabel?: string;
    /** To disable the field */
    disabled?: boolean;
    /**  Optional action performed on value change*/
    onChange?: (val: number | typeof RESET) => void;
    /** If true, and the associated has a synced val, we use it instead of the field's main value */
    useSyncedVal?: boolean;
} & InputLabelProps;
export type {EnumFieldProps};

/**
 * A component that renders a group of enum options with selection functionality.
 * Supports different display modes and integrates with form-atoms.
 *
 * @template T - The type of the field
 * @param {EnumFieldProps<confAtom>} props - The component props
 * @returns {JSX.Element} A view containing the enum options and label
 * @category Forms
 */
export function EnumField<T extends Field<number>>({field, mode = 'input', emptyValueLabel = 'Not entered', ...props}: EnumFieldProps<T>) {
    // --- local state
    const isReport = mode === 'report';
    const isSheet = mode === 'sheet';
    const isInput = mode === 'input';

    // --- shared state
    const visible = isReport || isSheet || (field.visible ? field.visible() : true);
    const mandatory = field.mandatory && (typeof field.mandatory === 'function' ? field.mandatory() : field.mandatory);
    const smallScreen = useAtomValue(smallScreenAtom);

    // --- effects
    if (field.effects) {
        field.effects.map(useEffect => useEffect());
    }

    // --- utils

    // --- rendering
    return visible && field.options ? (
        <View className={cn('flex-col', isInput && 'gap-4', isSheet && 'gap-3', isReport && !smallScreen && 'flex-row items-center gap-x-1 gap-y-2')}>
            {/* Label */}
            <InputLabel label={props.label} labelClassName={props.labelClassName} mode={mode} mandatory={mandatory} labelAppend={props.labelAppend} />

            {/* Showing the available options */}
            {!isInput ? (
                // Here, only showing the choosen value
                <CurrentEnumFieldValue
                    field={field}
                    className={props.valueClassName}
                    mode={mode}
                    emptyValueLabel={emptyValueLabel}
                    disabledValue={props.disabled}
                    useSyncedVal={props.useSyncedVal}
                />
            ) : (
                <View className="flex-row flex-wrap gap-3">
                    {field.optionsOnly
                        ? // if we restrict to some values, then we only consider those
                          field.optionsOnly
                              .map(value => field.options?.find(item => item.value === value))
                              .map(
                                  option =>
                                      option && (
                                          <EnumFieldValue
                                              key={option.value.toString()}
                                              option={option}
                                              field={field}
                                              className={props.valueClassName}
                                              infos={field.optionsInfos?.get(option.value)}
                                              disabledValue={props.disabled}
                                              onChange={props.onChange}
                                          />
                                      ),
                              )
                        : // else it's normal business, we allow to select any option
                          field.options.map(option => (
                              <EnumFieldValue
                                  key={option.value.toString()}
                                  option={option}
                                  field={field}
                                  className={props.valueClassName}
                                  infos={field.optionsInfos?.get(option.value)}
                                  disabledValue={props.disabled}
                                  onChange={props.onChange}
                              />
                          ))}
                </View>
            )}
        </View>
    ) : null;
}
