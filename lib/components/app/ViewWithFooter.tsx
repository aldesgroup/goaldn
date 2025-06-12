import {useAtomValue} from 'jotai';
import {LucideIcon, MoveLeft, MoveRight} from 'lucide-react-native';
import React from 'react';
import {ScrollView, View} from 'react-native';
import {cn} from '../../utils/cn';
import {smallScreenAtom} from '../../utils/settings';
import {Button, buttonVariantsType, textColorForVariant} from '../ui/custom/button-pimped';
import {Txt} from '../ui/custom/txt';

/**
 * Props for the ViewWithFooter component.
 * @property {React.ReactNode} children - The content to display in the scrollable area
 * @property {string} [contentClassName] - Additional CSS classes for the content area
 * @property {string} [footerClassName] - Additional CSS classes for the footer
 * @property {string} [leftButtonLabel='Previous'] - Label for the left button
 * @property {buttonVariantsType} [leftButtonVariant='secondary'] - Variant for the left button
 * @property {(() => void) | null} leftButtonOnPress - Function to call when left button is pressed
 * @property {boolean} [leftButtonDisabled] - Whether the left button is disabled
 * @property {LucideIcon | null} [leftButtonIcon=MoveLeft] - Icon for the left button
 * @property {string} [rightButtonLabel='Next'] - Label for the right button
 * @property {buttonVariantsType} [rightButtonVariant='default'] - Variant for the right button
 * @property {() => void} rightButtonOnPress - Function to call when right button is pressed
 * @property {boolean} [rightButtonDisabled] - Whether the right button is disabled
 * @property {LucideIcon | null} [rightButtonIcon=MoveRight] - Icon for the right button
 */
export type viewWithFooterProps = {
    children: React.ReactNode;
    contentClassName?: string;
    footerClassName?: string;
    leftButtonLabel?: string;
    leftButtonVariant?: buttonVariantsType;
    leftButtonOnPress: null | (() => void);
    leftButtonDisabled?: boolean;
    leftButtonIcon?: null | LucideIcon;
    rightButtonLabel?: string;
    rightButtonVariant?: buttonVariantsType;
    rightButtonOnPress: () => void;
    rightButtonDisabled?: boolean;
    rightButtonIcon?: null | LucideIcon;
};

/**
 * A view component with a fixed footer containing navigation buttons.
 * The content area is scrollable and the footer remains fixed at the bottom.
 * Supports customizable buttons with icons and variants.
 *
 * @param {viewWithFooterProps} props - The component props
 * @returns {JSX.Element} A view with scrollable content and fixed footer
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
}: viewWithFooterProps) {
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
