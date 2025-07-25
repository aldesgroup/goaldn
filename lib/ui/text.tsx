import * as Slot from '@rn-primitives/slot';
import type {SlottableTextProps, TextRef} from '@rn-primitives/types';
import * as React from 'react';
import {Text as RNText} from 'react-native';
import {cn} from '../base';

const TextClassContext = React.createContext<string | undefined>(undefined);

const Text = React.forwardRef<TextRef, SlottableTextProps>(({className, asChild = false, ...props}, ref) => {
    const textClass = React.useContext(TextClassContext);
    const Component = asChild ? Slot.Text : RNText;
    return <Component className={cn('text-foreground text-base web:select-text', textClass, className)} ref={ref} {...props} />;
});
Text.displayName = 'Text';

export {Text, TextClassContext};
