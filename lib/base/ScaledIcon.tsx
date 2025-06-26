import {LucideIcon} from 'lucide-react-native';
import {getFontScale} from '../settings';

/**
 * Props for the ScaledIcon component.
 * @category Types
 */
export type ScaledIconProps = {
    /** The Lucide icon component to render */
    Icon: LucideIcon;
    /** The color of the icon */
    color: string;
    /** The base size of the icon */
    size?: number;
    /** The maximum size the icon can scale to */
    sizeMax?: number;
    /** The horizontal translation offset */
    translateX?: number;
};

/**
 * A component that renders a Lucide icon with dynamic scaling based on font scale.
 * The icon size scales proportionally between the base size and maximum size.
 *
 * @param {ScaledIconProps} props - The component props
 * @returns {JSX.Element} A scaled icon component
 * @category Base
 */
export function ScaledIcon({Icon, color, size = 20, sizeMax = 30, translateX = 4, ...props}: ScaledIconProps) {
    const scale = getFontScale();
    const scaledSize = size + (sizeMax - size) * (scale - 1);
    return <Icon size={scaledSize} color={color} />;
}
