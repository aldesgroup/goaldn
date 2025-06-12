import {LucideIcon} from 'lucide-react-native';
import {View} from 'react-native';
import {getFontScale} from '../../../utils/settings';
import Tooltip, {TooltipProps} from './tooltip';

/**
 * Props for the ScaledTooltip component.
 * Extends TooltipProps but omits the trigger property and adds icon-specific properties.
 * @property {LucideIcon} Icon - The Lucide icon component to use as the tooltip trigger
 * @property {string} iconColor - The color of the icon
 * @property {number} [iconSize=20] - The base size of the icon
 * @property {number} [iconSizeMax=30] - The maximum size the icon can scale to
 * @property {number} [translateX=4] - The horizontal translation offset
 */
type ScaledTooltipProps = Partial<Omit<TooltipProps, 'trigger'>> & {
    Icon: LucideIcon;
    iconColor: string;
    iconSize?: number;
    iconSizeMax?: number;
    translateX?: number;
};

/**
 * A component that renders a tooltip with a dynamically scaled icon trigger.
 * The icon size scales proportionally between the base size and maximum size.
 *
 * @param {ScaledTooltipProps} props - The component props
 * @returns {JSX.Element} A tooltip component with a scaled icon trigger
 */
export function ScaledTooltip({Icon, iconColor, iconSize = 20, iconSizeMax = 30, translateX = 4, ...props}: ScaledTooltipProps) {
    const scale = getFontScale();
    const scaledSize = iconSize + (iconSizeMax - iconSize) * (scale - 1);
    return <Tooltip trigger={<Icon size={scaledSize} color={iconColor} />} {...props} />;
}
