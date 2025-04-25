import React, {useState, useRef, useEffect} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {cn} from '../../../utils/cn';
import {Txt} from './txt';

interface TooltipProps {
    trigger: React.ReactNode;
    text?: string;
    children?: React.ReactNode;
    className?: string; // For styling the container
    textClassName?: string; // For styling the tooltip text
    // position?: 'top' | 'bottom' | 'left' | 'right'; // Basic positioning

    // If false, then when the children (trigger) is release, the tooltip closes;
    // if true, then the content must be clicked again to close the tooltip
    persistent?: boolean;
}

export function Tooltip({trigger, text, children, className, textClassName = '', persistent}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const triggerRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);

    // const getTooltipPositionStyles = () => {
    //     switch (position) {
    //         case 'top':
    //             return {bottom: '105%', left: '50%', transform: [{translateX: '-50%'}]};
    //         case 'bottom':
    //             return {top: '105%', left: '50%', transform: [{translateX: '-50%'}]};
    //         case 'left':
    //             return {right: '105%', top: '50%', transform: [{translateY: '-50%'}]};
    //         case 'right':
    //             return {left: '105%', top: '50%', transform: [{translateY: '-50%'}]};
    //         default:
    //             return {top: '105%', left: '50%', transform: [{translateX: '-50%'}]};
    //     }
    // };

    useEffect(() => {
        const measureTriggerPosition = () => {
            if (triggerRef.current) {
                triggerRef.current.measureInWindow((x, y, width, height) => {
                    console.log('Trigger horizontal position (x):', x);
                    console.log('Trigger width:', width);
                    // You can store 'x' and 'width' in a state if you need to use it in your component's logic
                });
            }
        };

        measureTriggerPosition();
    }, []);

    return (
        // <View className={cn('relative inline-block', className)}>
        <View className={cn('relative inline-block', className)}>
            {persistent ? (
                <TouchableOpacity ref={triggerRef} onPress={() => setIsVisible(!isVisible)}>
                    {trigger}
                </TouchableOpacity>
            ) : (
                <TouchableOpacity ref={triggerRef} onPressIn={() => setIsVisible(true)} onPressOut={() => setIsVisible(false)}>
                    {trigger}
                </TouchableOpacity>
            )}

            {isVisible && (
                <TouchableOpacity
                    style={{bottom: '105%', transform: [{translateX: '-50%'}]}}
                    className="bg-primary absolute z-10 w-96 rounded-xl p-3 shadow-xl shadow-black"
                    onPress={() => setIsVisible(false)}>
                    {children ? children : <Txt className={cn('text-primary-foreground text-lg', textClassName)}>{text}</Txt>}
                </TouchableOpacity>
            )}
        </View>
    );
}

export default Tooltip;
