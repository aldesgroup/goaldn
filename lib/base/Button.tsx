import {cva, type VariantProps} from 'class-variance-authority';
import {useAtomValue} from 'jotai';
import * as React from 'react';
import {Pressable} from 'react-native';
import {cn} from '../base';
import {smallScreenAtom} from '../settings';
import {getColors} from '../styling';
import {TextClassContext} from '../ui/text';

/**
 * Configuration object for button variants and sizes.
 * Defines the styling variants and size options for the Button component.
 * @category Types
 */
export const buttonVariantsConfig = {
    variants: {
        variant: {
            default: 'bg-primary web:hover:opacity-90 active:opacity-90',
            destructive: 'bg-destructive web:hover:opacity-90 active:opacity-90 border-destructive-darker border-2',
            // outline:
            // 	"border border-input bg-background web:hover:bg-accent web:hover:text-accent-foreground active:bg-accent",
            secondary: 'border-2 border-secondary-darker bg-secondary web:hover:opacity-80 active:opacity-80',
            // ghost: "web:hover:bg-accent web:hover:text-accent-foreground active:bg-accent",
            // link: "web:underline-offset-4 web:hover:underline web:focus:underline",
        },
        size: {
            default: 'h-10 px-4 py-2 native:h-12 native:px-5 native:py-2',
            sm: 'h-9 rounded-md px-3',
            lg: 'h-11 rounded-md px-8 native:h-14',
            icon: 'h-10 w-10',
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'default',
    },
} as const;

/**
 * Creates a class variance authority (cva) instance for button styling.
 * Combines base styles with variant and size configurations.
 * @category Types
 */
const buttonVariants = cva(
    'group flex items-center justify-center rounded-md web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
    buttonVariantsConfig,
);

/**
 * Creates a class variance authority (cva) instance for button text styling.
 * Defines text styles based on button variant and size.
 * @category Types
 */
const buttonTextVariants = cva('web:whitespace-nowrap text-sm native:text-base font-medium text-foreground web:transition-colors', {
    variants: {
        variant: {
            default: 'text-primary-foreground',
            destructive: 'text-destructive-foreground',
            // outline: "group-active:text-accent-foreground",
            secondary: 'text-secondary-foreground group-active:text-secondary-foreground',
            // ghost: "group-active:text-accent-foreground",
            // link: "text-primary group-active:underline",
        },
        size: {
            default: '',
            sm: '',
            lg: 'native:text-lg',
            icon: '',
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'default',
    },
});

/**
 * Props type for the Button component.
 * Extends Pressable props and includes variant and size options.
 * @category Types
 */
type ButtonProps = React.ComponentPropsWithoutRef<typeof Pressable> &
    VariantProps<typeof buttonVariants> & {
        /** To style the text, with NativeWind */
        className?: string;
    };

/**
 * A customizable button component that supports different variants and sizes.
 * Handles responsive design and accessibility features.
 *
 * @param {ButtonProps} props - The component props
 * @param {React.Ref<typeof Pressable>} ref - Forwarded ref
 * @returns {JSX.Element} A styled button component
 * @category Base
 */
export function ButtonImpl({className, variant, size, ...props}: ButtonProps, ref: React.Ref<React.ComponentRef<typeof Pressable>>) {
    const smallScreen = useAtomValue(smallScreenAtom);
    return (
        <TextClassContext.Provider
            value={buttonTextVariants({
                variant,
                size,
                className: cn(
                    'web:pointer-events-none',
                    props.disabled && 'text-muted-foreground', // homogenize the "disabled" style
                ),
            })}>
            <Pressable
                className={cn(
                    props.disabled && 'opacity-50 web:pointer-events-none',
                    buttonVariants({variant, size, className}),
                    props.disabled && 'bg-muted border-0 opacity-100', // homogenize the "disabled" style
                    smallScreen && 'native:h-auto native:p-4 h-auto p-4', // handling small screens / big font size
                )}
                ref={ref}
                role="button"
                {...props}
            />
        </TextClassContext.Provider>
    );
}

/**
 * A customizable button component that supports different variants and sizes.
 * Handles responsive design and accessibility features.
 *
 * @see ButtonImpl for how to use this component
 * @category Base
 */
export const Button = React.forwardRef<React.ComponentRef<typeof Pressable>, ButtonProps>(ButtonImpl);

export {buttonTextVariants, buttonVariants};
export type {ButtonProps};

/**
 * Type representing the available button variants.
 * @category Types
 */
export type buttonVariantsType = keyof typeof buttonVariantsConfig.variants.variant;

/**
 * Returns the appropriate text color for a button variant.
 *
 * @param {buttonVariantsType} variant - The button variant
 * @param {boolean} [disabled] - Whether the button is disabled
 * @returns {string} The color value for the text
 * @category Types
 */
export const textColorForVariant = (variant: buttonVariantsType, disabled?: boolean) => {
    if (disabled) {
        return getColors().mutedForeground;
    }
    switch (variant) {
        case 'destructive':
            return getColors().destructiveForeground;
        case 'secondary':
            return getColors().secondaryForeground;
        default:
            return getColors().primaryForeground;
    }
};
