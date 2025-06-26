import React, {useEffect, useRef, useState} from 'react';
import {Dimensions, TouchableOpacity, View} from 'react-native';
import {cn, Txt} from '../base';
import {getColors} from '../styling';

/**
 * Props for the Tooltip component.
 * @category Types
 */
export type TooltipProps = {
    /** The element that triggers the tooltip display */
    trigger: React.ReactNode;
    /** The text content of the tooltip */
    text?: string;
    /** Custom content to render inside the tooltip */
    children?: React.ReactNode;
    /** Additional CSS classes for the container */
    className?: string; // For styling the container
    /** Additional CSS classes for the tooltip text */
    textClassName?: string; // For styling the tooltip text
    /** If true, the tooltip appears below the trigger; otherwise above */
    underTrigger?: boolean; // if true, the tooltip is shown under the trigger, otherwise above it
    /** The size of the trigger element */
    triggerSize?: number; // the trigger size
    /** The background color of the tooltip */
    bgColor?: string; // the tooltip background color
    /** The text color of the tooltip */
    textColor?: string; // the tooltip text color
    /** Percentage of screen width to leave as margin on both sides */
    borderWidth?: number; // percentage of the screen left on both sides of the tooltip
    /** If true, tooltip requires explicit close; if false, closes on trigger release */
    persistent?: boolean;
};

/**
 * Layout information for positioning the tooltip.
 * @property {number} x - The x-coordinate of the element
 * @property {number} y - The y-coordinate of the element
 * @property {number} width - The width of the element
 * @property {number} height - The height of the element
 * @category Layout
 */
type layout = {
    x: number;
    y: number;
    width: number;
    height: number;
};

const colors = getColors();

/**
 * A tooltip component that displays additional information when hovering over or pressing a trigger element.
 * The tooltip can be positioned above or below the trigger and supports both text and custom content.
 *
 * @param {TooltipProps} props - The component props
 * @returns {JSX.Element} A tooltip component with customizable positioning and styling
 * @category Layout
 */
export function Tooltip({
    trigger,
    text,
    children,
    className,
    textClassName = '',
    underTrigger,
    bgColor = colors.primary,
    textColor = colors.primaryForeground,
    triggerSize = 20,
    borderWidth = 0.05,
    persistent,
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const triggerRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);
    const {width: screenWidth} = Dimensions.get('window');
    const [triggerLayout, setTriggerLayout] = useState<layout | null>(null);
    const tooltipWidth = (1 - 2 * borderWidth) * screenWidth; // the tooltip's width will be 80% of the screen's width
    const tooltipLeft = triggerLayout ? -(triggerLayout.x - borderWidth * screenWidth) : 0;
    const triggerHeight = triggerLayout ? triggerLayout.height : 0;
    const triggerWidth = triggerLayout ? triggerLayout.width : 0;

    useEffect(() => {
        const measureTriggerPosition = () => {
            if (triggerRef.current) {
                triggerRef.current.measureInWindow((x, y, width, height) => {
                    setTriggerLayout({x, y, width, height});
                });
            }
        };

        measureTriggerPosition();
    }, []);

    return (
        <View className={cn('relative inline-block', className)}>
            {/* The trigger, which should be an icon */}
            {/* The trigger, which should be an icon */}
            {persistent ? (
                <TouchableOpacity ref={triggerRef} onPress={() => setIsVisible(!isVisible)}>
                    {trigger}
                </TouchableOpacity>
            ) : (
                <TouchableOpacity ref={triggerRef} onPressIn={() => setIsVisible(true)} onPressOut={() => setIsVisible(false)}>
                    {trigger}
                </TouchableOpacity>
            )}

            {/* The tooltip */}
            {isVisible && (
                <View
                    className="absolute z-10"
                    style={[
                        {left: tooltipLeft, width: tooltipWidth},
                        !!underTrigger ? {top: triggerHeight + triggerSize} : {bottom: triggerHeight + triggerSize},
                    ]}>
                    {/* Upward pointer */}
                    {underTrigger && (
                        <View
                            style={[
                                {
                                    position: 'absolute',
                                    borderLeftWidth: triggerSize / 2,
                                    borderRightWidth: triggerSize / 2,
                                    top: -triggerSize,
                                    borderLeftColor: 'transparent',
                                    borderRightColor: 'transparent',
                                    borderBottomWidth: triggerSize,
                                    borderBottomColor: bgColor,
                                    left: -tooltipLeft - triggerSize / 2 + triggerWidth / 2,
                                },
                            ]}
                        />
                    )}

                    {/* Tooltip main bit */}
                    <TouchableOpacity
                        style={{backgroundColor: bgColor}} //
                        className="rounded-xl p-3 shadow-xl shadow-black"
                        onPress={() => setIsVisible(false)}>
                        {children ? (
                            children
                        ) : (
                            <Txt style={{color: textColor}} className={cn('text-lg', textClassName)}>
                                {text}
                            </Txt>
                        )}
                    </TouchableOpacity>

                    {/* Downward pointer */}
                    {!underTrigger && (
                        <View
                            style={[
                                {
                                    position: 'absolute',
                                    // zIndex: 10,
                                    borderLeftWidth: triggerSize / 2,
                                    borderRightWidth: triggerSize / 2,
                                    bottom: -triggerSize,
                                    borderLeftColor: 'transparent',
                                    borderRightColor: 'transparent',
                                    borderTopWidth: triggerSize,
                                    borderTopColor: bgColor,
                                    left: -tooltipLeft - triggerSize / 2 + triggerWidth / 2,
                                },
                            ]}
                        />
                    )}
                </View>
            )}
        </View>
    );
}

export default Tooltip;
