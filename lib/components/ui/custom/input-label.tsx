import {useAtomValue} from 'jotai';
import React, {ReactNode} from 'react';
import {View} from 'react-native';
import {cn} from '../../../utils/cn';
import {fieldDisplayMode} from '../../../utils/fields';
import {smallScreenAtom} from '../../../utils/settings';
import {Txt} from './txt';

/**
 * Props for the InputLabel component.
 * @property {string} label - The text label to display
 * @property {string} [labelClassName] - Additional CSS classes for the label
 * @property {ReactNode} [labelAppend] - Additional content to append after the label
 * @property {fieldDisplayMode} [mode] - The display mode of the label
 * @property {boolean} [mandatory] - Whether the field is mandatory
 * @property {boolean} [sideValue] - Whether to display the label on the side
 */
export type InputLabelProps = {
    label: string;
    labelClassName?: string;
    labelAppend?: ReactNode;
    mode?: fieldDisplayMode;
    mandatory?: boolean;
    sideValue?: boolean; // display on the side
};

/**
 * A component for displaying input field labels with various configurations.
 * Supports different display modes, mandatory indicators, and appended content.
 *
 * @param {InputLabelProps} props - The component props
 * @returns {JSX.Element} A label component with optional appended content
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
                }>
                {props.label}
            </Txt>
            {labelAppend && labelAppend}
        </View>
    );
}
