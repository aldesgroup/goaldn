import {RESET} from 'form-atoms';
import {useAtom, useAtomValue, WritableAtom} from 'jotai';
import {X} from 'lucide-react-native';
import {Pressable, View} from 'react-native';
import {cn, InputLabel, InputLabelProps, Txt} from '../base';
import {fieldDisplayMode} from '../forms';
import {getColors} from '../styling';

/**
 * Type representing a value that can be converted to a string.
 */
type kindaString = {
    toString(): string;
};

/**
 * Props for the EnumAtomValue component.
 * @template T - The type of the enum value
 * @template A - The type of the atom
 * @category Types
 */
type EnumAtomValueProps<T extends kindaString | Promise<kindaString>, A extends WritableAtom<T | Promise<T>, any, any>> = {
    /** The enum option value */
    option: T;
    /** The Jotai atom controlling the selection */
    atom: A;
    /** Additional CSS classes for the badge */
    badgeClassName?: string;
    /** Additional CSS classes for the text */
    textClassName?: string;
    /** The display mode of the component */
    mode?: fieldDisplayMode;
    /** Whether to render raw text without styling */
    raw?: boolean;
};
export type {EnumAtomValueProps};

/**
 * A component that renders a single enum option value.
 * Handles selection state and user interaction.
 *
 * @template T - The type of the enum value
 * @template A - The type of the atom
 * @param {EnumAtomValueProps<T, A>} props - The component props
 * @returns {JSX.Element} A pressable badge showing the enum option
 * @category State Management
 */
function EnumAtomValue<T extends kindaString | Promise<kindaString>, A extends WritableAtom<T | Promise<T>, any, any>>({
    option,
    atom,
    badgeClassName,
    textClassName,
    mode = 'input',
    raw,
}: EnumAtomValueProps<T, A>) {
    // shared state
    const [value, setValue] = useAtom(atom);
    const colors = getColors();

    // local state
    const selected = value === option;
    const isInput = mode === 'input';
    const disabled = false;
    const iconColor = disabled ? colors.mutedForeground : colors.primary;

    // view
    return (
        <Pressable
            onPress={() => {
                if (isInput && !disabled) {
                    if (selected) {
                        setValue(RESET);
                    } else {
                        setValue(option);
                    }
                }
            }}>
            <View
                className={cn(
                    'border-border bg-secondary flex-row items-center gap-2 rounded-full border px-5 py-1',
                    badgeClassName,
                    selected && 'bg-primary-light',
                    disabled && 'bg-muted',
                )}>
                <Txt className={cn('text-normal font-normal', textClassName, disabled ? 'text-muted-foreground' : 'text-primary')} raw={raw}>
                    {option.toString()}
                </Txt>
                {isInput && selected && <X color={iconColor} size={18} />}
            </View>
        </Pressable>
    );
}

/**
 * A component that displays the currently selected enum value.
 * Shows a placeholder when no value is selected.
 *
 * @template T - The type of the enum value
 * @template A - The type of the atom
 * @param {Object} props - The component props
 * @param {T[]} props.options - Available enum options
 * @param {A} props.atom - The Jotai atom controlling the selection
 * @param {string} [props.badgeClassName] - Additional CSS classes for the badge
 * @param {string} [props.textClassName] - Additional CSS classes for the text
 * @param {fieldDisplayMode} props.mode - The display mode of the component
 * @param {string} props.emptyValueLabel - Text to show when no value is selected
 * @returns {JSX.Element} A view showing the current selection or placeholder
 * @category State Management
 */
function CurrentEnumAtomValue<T extends kindaString | Promise<kindaString>, A extends WritableAtom<T | Promise<T>, any, any>>({
    options,
    atom,
    badgeClassName,
    textClassName,
    mode,
    emptyValueLabel,
}: {
    options: T[];
    atom: A;
    badgeClassName?: string;
    textClassName?: string;
    mode: fieldDisplayMode;
    emptyValueLabel: string;
}) {
    // shared state
    const value = useAtomValue(atom);
    const option = options.find(item => item === value);

    // rendering
    return option ? (
        <View className="flex-wrap">
            <EnumAtomValue atom={atom} badgeClassName={badgeClassName} textClassName={textClassName} option={option} mode={mode} />
        </View>
    ) : (
        <Txt className="text-muted-foreground">{emptyValueLabel}</Txt>
    );
}

/**
 * Props for the EnumAtom component.
 * @template T - The type of the enum value
 * @template A - The type of the atom
 * @category Types
 */
type EnumAtomProps<T extends kindaString | Promise<kindaString>, A extends WritableAtom<T | Promise<T>, any, any>> = {
    /** The Jotai atom controlling the selection */
    atom: A;
    /** Available enum options */
    options: T[];
    /** Additional CSS classes for the badge */
    badgeClassName?: string;
    /** Additional CSS classes for the text */
    textClassName?: string;
    /** Text to show when no value is selected */
    emptyValueLabel?: string;
    /** Whether to render raw text without styling */
    raw?: boolean;
} & InputLabelProps;
export type {EnumAtomProps};

/**
 * A component that renders a group of enum options with selection functionality.
 * Supports different display modes and integrates with Jotai atoms.
 *
 * @template T - The type of the enum value
 * @template A - The type of the atom
 * @param {EnumAtomProps<T, A>} props - The component props
 * @returns {JSX.Element} A view containing the enum options and label
 * @category State Management
 */
export function EnumAtom<T extends kindaString | Promise<kindaString>, A extends WritableAtom<T | Promise<T>, any, any>>({
    atom,
    options,
    mode = 'input',
    emptyValueLabel = 'Not entered',
    mandatory,
    ...props
}: EnumAtomProps<T, A>) {
    // local state
    const isReport = mode === 'report';
    const isSheet = mode === 'sheet';
    const isInput = mode === 'input';

    // shared state

    // effects

    // utils

    // rendering
    return (
        <View className={cn('flex-col', isInput && 'gap-4', isSheet && 'gap-3', isReport && 'flex-row items-center gap-x-1 gap-y-2')}>
            {/* Label */}
            <InputLabel label={props.label} labelClassName={props.labelClassName} mode={mode} mandatory={mandatory} labelAppend={props.labelAppend} />
            {/* Showing the available options */}
            {!isInput ? (
                // Here, only showing the choosen value
                <CurrentEnumAtomValue
                    atom={atom}
                    options={options}
                    badgeClassName={props.badgeClassName}
                    textClassName={props.textClassName}
                    mode={mode}
                    emptyValueLabel={emptyValueLabel}
                />
            ) : (
                <View className="flex-row flex-wrap gap-3">
                    {options.map(option => (
                        <EnumAtomValue
                            key={option.toString()}
                            option={option}
                            atom={atom}
                            badgeClassName={props.badgeClassName}
                            textClassName={props.textClassName}
                            raw={props.raw}
                        />
                    ))}
                </View>
            )}
        </View>
    );
}
