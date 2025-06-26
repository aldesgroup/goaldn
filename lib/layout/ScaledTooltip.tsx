import {LucideIcon} from 'lucide-react-native';
import {getFontScale} from '../settings';
import Tooltip, {TooltipProps} from './Tooltip';

/**
 * Props for the ScaledTooltip component.
 * Extends TooltipProps but omits the trigger property and adds icon-specific properties.
 * @category Types
 */
export type ScaledTooltipProps = Partial<Omit<TooltipProps, 'trigger'>> & {
    /** The Lucide icon component to use as the tooltip trigger */
    Icon: LucideIcon;
    /** The color of the icon */
    iconColor: string;
    /** The base size of the icon */
    iconSize?: number;
    /** The maximum size the icon can scale to */
    iconSizeMax?: number;
    /** The horizontal translation offset */
    translateX?: number;
};

/**
 * A component that renders a tooltip with a dynamically scaled icon trigger.
 * The icon size scales proportionally between the base size and maximum size.
 *
 * @param {ScaledTooltipProps} props - The component props
 * @returns {JSX.Element} A tooltip component with a scaled icon trigger
 * @category Layout
 */
export function ScaledTooltip({Icon, iconColor, iconSize = 20, iconSizeMax = 30, translateX = 4, ...props}: ScaledTooltipProps) {
    const scale = getFontScale();
    const scaledSize = iconSize + (iconSizeMax - iconSize) * (scale - 1);
    return <Tooltip trigger={<Icon size={scaledSize} color={iconColor} />} {...props} />;
}
