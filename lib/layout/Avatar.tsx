import {CircleUserRound, LucideIcon} from 'lucide-react-native';
import React, {useRef, useState} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {cn, Txt} from '../base';

/**
 * Configuration for a single avatar menu entry.
 * @category Layout
 */
type AvatarEntry = {
    /** The icon to display for this entry */
    icon: LucideIcon;
    /** The label text for this entry */
    label: string;
    /** The function to call when this entry is pressed */
    onPress: () => void;
};

/**
 * Props for the Avatar component.
 * @category Types
 */
export type AvatarProps = {
    /** Array of menu entries to display */
    entries: AvatarEntry[];
    /** Custom trigger element to show/hide the menu */
    trigger?: React.ReactNode;
    /** Additional CSS classes for the container */
    className?: string;
};

/**
 * Default trigger component for the Avatar.
 * Renders a user circle icon.
 *
 * @returns {JSX.Element} A circle user icon component
 * @category Layout
 */
function DefaultTrigger() {
    return <CircleUserRound />;
}

/**
 * A component that displays a user avatar with a dropdown menu.
 * The menu can be triggered by clicking the avatar icon and displays a list of actions.
 *
 * @param {AvatarProps} props - The component props
 * @returns {JSX.Element} An avatar component with dropdown menu
 * @category Layout
 */
export function Avatar({entries, trigger = <DefaultTrigger />, className}: AvatarProps) {
    const [isVisible, setIsVisible] = useState(false);
    const triggerRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);
    // const {width: screenWidth} = Dimensions.get('window');
    // const [triggerLayout, setTriggerLayout] = useState<layout | null>(null);
    // const tooltipWidth = (1 - 2 * borderWidth) * screenWidth; // the tooltip's width will be 80% of the screen's width
    // const tooltipLeft = triggerLayout ? -(triggerLayout.x - borderWidth * screenWidth) : 0;
    // const triggerHeight = triggerLayout ? triggerLayout.height : 0;
    // const triggerWidth = triggerLayout ? triggerLayout.width : 0;

    return (
        <View className={cn('relative inline-block', className)}>
            {/* The trigger, which should be an icon */}
            <TouchableOpacity ref={triggerRef} onPress={() => setIsVisible(!isVisible)}>
                {trigger}
            </TouchableOpacity>
            ){/* The tooltip */}
            {isVisible && (
                <View
                    className="absolute z-10"
                    style={[
                        {backgroundColor: '#00F', top: 15, right: 15},
                        // {left: 20, top: 100, width: 200},
                        // !!underTrigger ? {top: triggerHeight + triggerSize} : {bottom: triggerHeight + triggerSize},
                    ]}>
                    {/* Menu main bit */}
                    {entries.map((entry, index) => (
                        // <TouchableOpacity onPress={entry.onPress} key={index}>
                        // {/* <>{entry.icon}</> */}
                        <>
                            <Txt key={index + 1}>{entry.label}</Txt>
                            <Txt key={2 * index + 2}>{entry.label}</Txt>
                            <Txt key={3 * index + 3}>{entry.label}</Txt>
                        </>
                        // </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
}
