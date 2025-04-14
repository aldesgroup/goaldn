// Custom component ythat should handle i18n automatically

import type {SlottableTextProps, TextRef} from '@rn-primitives/types';
import * as React from 'react';
import {cn} from '../../../utils/cn';
import {useTranslator} from '../../../utils/i18n';
import {Text} from '../text';

interface TxtProps extends SlottableTextProps {
    children: React.ReactNode;
    raw?: boolean; // if true, then the text is not translated
}

const getTextContent = (input: React.ReactNode): string => {
    if (typeof input === 'string') return input;
    if (Array.isArray(input)) return input.map(getTextContent).join(''); // Flatten and join array elements
    return String(input); // Convert numbers or other types to string
};

const Txt = React.forwardRef<TextRef, TxtProps>(({children, raw, className, ...props}, ref) => {
    const text = getTextContent(children);
    if (raw) {
        return (
            <Text {...props} ref={ref} className={cn('text-left', className)}>
                {text}
            </Text>
        );
    }

    const translate = useTranslator();
    const {translation, missing} = translate(text);

    return (
        <Text {...props} ref={ref} className={cn('text-left', className, missing && 'text-red-600')}>
            {translation}
        </Text>
    );
});
Txt.displayName = 'Txt';

export {Txt};
