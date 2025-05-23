import {useAtomValue} from 'jotai';
import {ReactNode} from 'react';
import {View} from 'react-native';
import {cn} from '../../../utils/cn';
import {fieldDisplayMode} from '../../../utils/fields';
import {smallScreenAtom} from '../../../utils/settings';
import {Txt} from './txt';

export type InputLabelProps = {
    label: string;
    labelClassName?: string;
    labelAppend?: ReactNode;
    mode?: fieldDisplayMode;
    mandatory?: boolean;
    sideValue?: boolean; // display on the side
};

// Component used to put a label to an input field that:
// - can take several possible values,
// - be made mandatory,
// - have a tooltip appended, or something else,
// - etc.
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
