// Custom component that should handle i18n automatically

import type {SlottableTextProps, TextRef} from '@rn-primitives/types';
import * as React from 'react';
import {cn} from '../base';
import {useTranslator} from '../settings';
import {Text} from '../ui/text';

/**
 * Props for the Txt component.
 * Extends SlottableTextProps with additional properties for text handling and translation.
 * @category Types
 */
export type TxtProps = SlottableTextProps & {
    /** The text content to display */
    children: React.ReactNode;
    /** If true, the text is not translated */
    raw?: boolean; // if true, then the text is not translated
    /** Content to display before the text */
    prepend?: React.ReactNode;
    /** Content to display after the text */
    append?: React.ReactNode;
    /** To style the text, with NativeWind */
    className?: string;
};

/**
 * Extracts text content from a React node.
 * Handles strings, arrays, and other types by converting them to strings.
 *
 * @param {React.ReactNode} input - The input to extract text from
 * @returns {string} The extracted text content
 * @category Base
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
 * @param {string} className - The class name to apply to the text component
 * @param {React.ReactNode} prepend - The content to prepend to the text
 * @param {React.ReactNode} append - The content to append to the text
 * @param {boolean} raw - If true, the text is not translated
 * @param {React.ReactNode} children - The text content to display
 * @param {React.Ref<TextRef>} ref - The ref to apply to the text component
 * @param {SlottableTextProps} props - The props to apply to the text component
 * @returns {JSX.Element} A text component with i18n support
 * @category Base
 */
export function TxtImpl({children, raw, className, prepend, append, ...props}: TxtProps, ref: React.Ref<TextRef>) {
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
}

/**
 * A text component that handles internationalization automatically.
 * Supports raw text display, prepended/appended content, and translation.
 *
 * @see TxtImpl for how to use this component
 * @category Base
 */
export const Txt = React.forwardRef<TextRef, TxtProps>(TxtImpl);
