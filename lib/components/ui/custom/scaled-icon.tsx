import {LucideIcon} from 'lucide-react-native';
import {View} from 'react-native';
import {getFontScale, getPixelDensity} from '../../../utils/settings';
import Tooltip, {TooltipProps} from './tooltip';

/**
 * Props for the ScaledIcon component.
 * @property {LucideIcon} Icon - The Lucide icon component to render
 * @property {string} color - The color of the icon
 * @property {number} [size=20] - The base size of the icon
 * @property {number} [sizeMax=30] - The maximum size the icon can scale to
 * @property {number} [translateX=4] - The horizontal translation offset
 */
type ScaledIconProps = {
    Icon: LucideIcon;
    color: string;
    size?: number;
    sizeMax?: number;
    translateX?: number;
};

/**
 * A component that renders a Lucide icon with dynamic scaling based on font scale.
 * The icon size scales proportionally between the base size and maximum size.
 *
 * @param {ScaledIconProps} props - The component props
 * @returns {JSX.Element} A scaled icon component
 */
export function ScaledIcon({Icon, color, size = 20, sizeMax = 30, translateX = 4, ...props}: ScaledIconProps) {
    const scale = getFontScale();
    const scaledSize = size + (sizeMax - size) * (scale - 1);
    return <Icon size={scaledSize} color={color} />;
}
