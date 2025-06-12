// Custom component that should handle i18n automatically

import type {SlottableTextProps, TextRef} from '@rn-primitives/types';
import * as React from 'react';
import {cn} from '../../../utils/cn';
import {useTranslator} from '../../../utils/i18n';
import {Text} from '../text';

/**
 * Props for the Txt component.
 * Extends SlottableTextProps with additional properties for text handling and translation.
 * @property {React.ReactNode} children - The text content to display
 * @property {boolean} [raw] - If true, the text is not translated
 * @property {React.ReactNode} [prepend] - Content to display before the text
 * @property {React.ReactNode} [append] - Content to display after the text
 */
interface TxtProps extends SlottableTextProps {
    children: React.ReactNode;
    raw?: boolean; // if true, then the text is not translated
    prepend?: React.ReactNode;
    append?: React.ReactNode;
}

/**
 * Extracts text content from a React node.
 * Handles strings, arrays, and other types by converting them to strings.
 *
 * @param {React.ReactNode} input - The input to extract text from
 * @returns {string} The extracted text content
 */
const getTextContent = (input: React.ReactNode): string => {
    if (typeof input === 'string') return input;
    if (Array.isArray(input)) return input.map(getTextContent).join(''); // Flatten and join array elements
    return String(input); // Convert numbers or other types to string
};

/**
 * A text component that handles internationalization automatically.
 * Supports raw text display, prepended/appended content, and translation.
 *
 * @param {TxtProps} props - The component props
 * @param {TextRef} ref - Forwarded ref for the underlying Text component
 * @returns {JSX.Element} A text component with i18n support
 */
const Txt = React.forwardRef<TextRef, TxtProps>(({children, raw, className, prepend, append, ...props}, ref) => {
    const text = getTextContent(children);
    if (raw) {
        return (
            <Text {...props} ref={ref} className={cn('text-left', className)}>
                {prepend && prepend}
                {text}
                {append && append}
            </Text>
        );
    }

    const translate = useTranslator();
    const {translation, missing} = translate(text);

    return (
        <Text {...props} ref={ref} className={cn('text-left', className, missing && 'text-red-600')}>
            {prepend && prepend}
            {translation}
            {append && append}
        </Text>
    );
});
Txt.displayName = 'Txt';

export {Txt};
