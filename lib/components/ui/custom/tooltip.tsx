import React, {useEffect, useRef, useState} from 'react';
import {Dimensions, TouchableOpacity, View} from 'react-native';
import {cn} from '../../../utils/cn';
import {Txt} from './txt';
import {getColors} from '../../../styles/theme';

export interface TooltipProps {
    trigger: React.ReactNode;
    text?: string;
    children?: React.ReactNode;
    className?: string; // For styling the container
    textClassName?: string; // For styling the tooltip text
    underTrigger?: boolean; // if true, the tooltip is shown under the trigger, otherwise above it
    triggerSize?: number; // the trigger size
    bgColor?: string; // the tooltip background color
    textColor?: string; // the tooltip text color
    borderWidth?: number; // percentage of the screen left on both sides of the tooltip

    // If false, then when the children (trigger) is release, the tooltip closes;
    // if true, then the content must be clicked again to close the tooltip
    persistent?: boolean;
}

type layout = {
    x: number;
    y: number;
    width: number;
    height: number;
};

const colors = getColors();

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
