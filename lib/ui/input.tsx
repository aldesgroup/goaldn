import * as React from 'react';
import {TextInput, type TextInputProps} from 'react-native';
import {cn} from '../base';

const Input = React.forwardRef<React.ElementRef<typeof TextInput>, TextInputProps>(({className, placeholderClassName, ...props}, ref) => {
    return (
        <TextInput
            ref={ref}
            className={cn(
                'native:h-12 border-input bg-background native:text-lg native:leading-[1.25] text-foreground placeholder:text-muted-foreground web:ring-offset-background web:focus-visible:ring-ring h-10 rounded-md border px-3 text-base file:border-0 file:bg-transparent file:font-medium web:flex web:w-full web:py-2 web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-offset-2 lg:text-sm',
                props.editable === false && 'opacity-50 web:cursor-not-allowed',
                className,
            )}
            placeholderClassName={cn('text-muted-foreground', placeholderClassName)}
            {...props}
        />
    );
});

Input.displayName = 'Input';

export {Input};
