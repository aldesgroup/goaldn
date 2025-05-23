import {cva, type VariantProps} from 'class-variance-authority';
import * as React from 'react';
import {Pressable} from 'react-native';
import {TextClassContext} from '../../../components/ui/text';
import {cn} from '../../../utils/cn';
import {getColors} from '../../../styles/theme';
import {smallScreenAtom} from '../../../utils/settings';
import {useAtomValue} from 'jotai';

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

const buttonVariants = cva(
    'group flex items-center justify-center rounded-md web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
    buttonVariantsConfig,
);

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

type ButtonProps = React.ComponentPropsWithoutRef<typeof Pressable> & VariantProps<typeof buttonVariants>;

const Button = React.forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(({className, variant, size, ...props}, ref) => {
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
});
Button.displayName = 'Button';

export {Button, buttonTextVariants, buttonVariants};
export type {ButtonProps};

export type buttonVariantsType = keyof typeof buttonVariantsConfig.variants.variant;
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
