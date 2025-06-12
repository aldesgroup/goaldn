import {CircleUserRound, LucideIcon} from 'lucide-react-native';
import React, {useRef, useState} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {cn} from '../../utils/cn';
import {Txt} from '../ui/custom/txt';

/**
 * Configuration for a single avatar menu entry.
 * @property {LucideIcon} icon - The icon to display for this entry
 * @property {string} label - The label text for this entry
 * @property {() => void} onPress - The function to call when this entry is pressed
 */
type AvatarEntry = {
    icon: LucideIcon;
    label: string;
    onPress: () => void;
};

/**
 * Props for the Avatar component.
 * @property {AvatarEntry[]} entries - Array of menu entries to display
 * @property {React.ReactNode} [trigger] - Custom trigger element to show/hide the menu
 * @property {string} [className] - Additional CSS classes for the container
 */
export type AvatarProps = {
    entries: AvatarEntry[];
    trigger?: React.ReactNode;
    className?: string;
};

/**
 * Default trigger component for the Avatar.
 * Renders a user circle icon.
 *
 * @returns {JSX.Element} A circle user icon component
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
