import {useAtomValue} from 'jotai';
import React, {ReactNode} from 'react';
import {View} from 'react-native';
import {fieldDisplayMode} from '../carots';
import {cn} from '../base';
import {smallScreenAtom} from '../settings';
import {Txt} from './Txt';

/**
 * Props for the InputLabel component.
 * @category Types
 */
export type InputLabelProps = {
    /** The text label to display */
    label: string;
    /** Additional CSS classes for the label */
    labelClassName?: string;
    /** Additional content to append after the label */
    labelAppend?: ReactNode;
    /** The display mode of the label */
    mode?: fieldDisplayMode;
    /** Whether the field is mandatory */
    mandatory?: boolean;
    /** Whether to display the label on the side */
    sideValue?: boolean;
    /** Do not try to translate the label */
    raw?: boolean;
};

/**
 * A component for displaying input field labels with various configurations.
 * Supports different display modes, mandatory indicators, and appended content.
 *
 * @param {InputLabelProps} props - The component props
 * @returns {JSX.Element} A label component with optional appended content
 * @category Base
 */
export function InputLabel({labelAppend, sideValue, ...props}: InputLabelProps) {
    // --- local state
    const isReport = props.mode === 'report';
    const isSheet = props.mode === 'sheet';
    const isInput = props.mode === 'input';

    // --- shared state
    const smallScreen = useAtomValue(smallScreenAtom);

    // --- view
    return (
        <View className={cn('flex-row items-center gap-2', (isReport || sideValue) && 'flex-1')}>
            <Txt
                className={cn(
                    props.labelClassName,
                    smallScreen && 'flex-1',
                    isSheet && 'text-sm font-bold uppercase',
                    isReport && 'text-foreground-light',
                )}
                append={
                    <>
                        {props.mandatory && isInput && (
                            <Txt className="text-warning-foreground flex-1" prepend=" ">
                                (mandatory)
                            </Txt>
                        )}
                        {isReport && <Txt raw>{' : '}</Txt>}
                    </>
                }
                raw={props.raw}>
                {props.label}
            </Txt>
            {labelAppend && labelAppend}
        </View>
    );
}
