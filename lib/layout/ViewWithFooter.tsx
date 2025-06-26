import {useAtomValue} from 'jotai';
import {LucideIcon, MoveLeft, MoveRight} from 'lucide-react-native';
import React from 'react';
import {ScrollView, View} from 'react-native';
import {Button, buttonVariantsType, cn, textColorForVariant, Txt} from '../base';
import {smallScreenAtom} from '../settings';

/**
 * Props for the ViewWithFooter component.
 * @category Types
 */
export type ViewWithFooterProps = {
    /** The content to display in the scrollable area */
    children: React.ReactNode;
    /** Additional CSS classes for the content area */
    contentClassName?: string;
    /** Additional CSS classes for the footer */
    footerClassName?: string;
    /** Label for the left button */
    leftButtonLabel?: string;
    /** Variant for the left button */
    leftButtonVariant?: buttonVariantsType;
    /** Function to call when left button is pressed */
    leftButtonOnPress: null | (() => void);
    /** Whether the left button is disabled */
    leftButtonDisabled?: boolean;
    /** Icon for the left button */
    leftButtonIcon?: null | LucideIcon;
    /** Label for the right button */
    rightButtonLabel?: string;
    /** Variant for the right button */
    rightButtonVariant?: buttonVariantsType;
    /** Function to call when right button is pressed */
    rightButtonOnPress: () => void;
    /** Whether the right button is disabled */
    rightButtonDisabled?: boolean;
    /** Icon for the right button */
    rightButtonIcon?: null | LucideIcon;
};

/**
 * A view component with a fixed footer containing navigation buttons.
 * The content area is scrollable and the footer remains fixed at the bottom.
 * Supports customizable buttons with icons and variants.
 *
 * @param {ViewWithFooterProps} props - The component props
 * @returns {JSX.Element} A view with scrollable content and fixed footer
 * @category Layout
 */
export function ViewWithFooter({
    contentClassName = 'p-8',
    leftButtonLabel = 'Previous',
    leftButtonVariant = 'secondary',
    leftButtonIcon = MoveLeft,
    rightButtonLabel = 'Next',
    rightButtonVariant = 'default',
    rightButtonIcon = MoveRight,
    ...props
}: ViewWithFooterProps) {
    // --- shared state
    const smallScreen = useAtomValue(smallScreenAtom);

    // --- local state
    const LeftButtonIcon = leftButtonIcon || (() => <></>);
    const RightButtonIcon = rightButtonIcon || (() => <></>);

    // --- view
    return (
        // Anchoring the footer
        <View className="flex-1">
            {/* Scrollable Content Area */}
            <ScrollView contentContainerClassName={cn('flex-grow flex-col gap-6', smallScreen && 'gap-9', contentClassName)}>
                {props.children}
            </ScrollView>

            {/* Footer */}
            <View
                className={cn(
                    'h-24 flex-row justify-between rounded-t-2xl border border-gray-300 bg-white p-6',
                    smallScreen && 'h-32',
                    !props.leftButtonOnPress && 'justify-end',
                    props.footerClassName,
                )}>
                {/* Left button */}
                {props.leftButtonOnPress && (
                    <Button variant={leftButtonVariant} onPress={props.leftButtonOnPress} disabled={props.leftButtonDisabled}>
                        <View className="flex-row items-center gap-3">
                            {!smallScreen && <LeftButtonIcon color={textColorForVariant(leftButtonVariant, props.leftButtonDisabled)} size={18} />}
                            <Txt>{leftButtonLabel}</Txt>
                        </View>
                    </Button>
                )}

                {/* Right button */}
                <Button variant={rightButtonVariant} onPress={props.rightButtonOnPress} disabled={props.rightButtonDisabled}>
                    <View className="flex-row items-center gap-3">
                        <Txt>{rightButtonLabel}</Txt>
                        {!smallScreen && <RightButtonIcon color={textColorForVariant(rightButtonVariant, props.rightButtonDisabled)} size={18} />}
                    </View>
                </Button>
            </View>
        </View>
    );
}
