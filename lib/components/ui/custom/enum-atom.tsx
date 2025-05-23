import {RESET} from 'form-atoms';
import {useAtom, useAtomValue, WritableAtom} from 'jotai';
import {X} from 'lucide-react-native';
import {ReactNode} from 'react';
import {Pressable, View} from 'react-native';
import {getColors} from '../../../styles/theme';
import {cn} from '../../../utils/cn';
import {fieldDisplayMode} from '../../../utils/fields';
import {Txt} from './txt';
import {InputLabel, InputLabelProps} from './input-label';

type kindaString = {
    toString(): string;
};

type EnumValueProps<T extends kindaString | Promise<kindaString>, A extends WritableAtom<T | Promise<T>, any, any>> = {
    option: T;
    atom: A;
    badgeClassName?: string;
    textClassName?: string;
    mode?: fieldDisplayMode;
    raw?: boolean;
};

function EnumValue<T extends kindaString | Promise<kindaString>, A extends WritableAtom<T | Promise<T>, any, any>>({
    option,
    atom,
    badgeClassName,
    textClassName,
    mode = 'input',
    raw,
}: EnumValueProps<T, A>) {
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

function CurrentEnumValue<T extends kindaString | Promise<kindaString>, A extends WritableAtom<T | Promise<T>, any, any>>({
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
            <EnumValue atom={atom} badgeClassName={badgeClassName} textClassName={textClassName} option={option} mode={mode} />
        </View>
    ) : (
        <Txt className="text-muted-foreground">{emptyValueLabel}</Txt>
    );
}

type EnumAtomProps<T extends kindaString | Promise<kindaString>, A extends WritableAtom<T | Promise<T>, any, any>> = {
    atom: A;
    options: T[];
    badgeClassName?: string;
    textClassName?: string;
    emptyValueLabel?: string;
    raw?: boolean;
} & InputLabelProps;

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
                <CurrentEnumValue
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
                        <EnumValue
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
