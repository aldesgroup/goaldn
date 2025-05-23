import {LucideIcon} from 'lucide-react-native';
import {View} from 'react-native';
import {getFontScale, getPixelDensity} from '../../../utils/settings';
import Tooltip, {TooltipProps} from './tooltip';

type ScaledIconProps = {
    Icon: LucideIcon;
    color: string;
    size?: number;
    sizeMax?: number;
    translateX?: number;
};

export function ScaledIcon({Icon, color, size = 20, sizeMax = 30, translateX = 4, ...props}: ScaledIconProps) {
    const scale = getFontScale();
    const scaledSize = size + (sizeMax - size) * (scale - 1);
    return <Icon size={scaledSize} color={color} />;
}
