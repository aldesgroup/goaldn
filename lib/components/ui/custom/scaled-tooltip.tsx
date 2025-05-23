import {LucideIcon} from 'lucide-react-native';
import {View} from 'react-native';
import {getFontScale} from '../../../utils/settings';
import Tooltip, {TooltipProps} from './tooltip';

type ScaledTooltipProps = Partial<Omit<TooltipProps, 'trigger'>> & {
    Icon: LucideIcon;
    iconColor: string;
    iconSize?: number;
    iconSizeMax?: number;
    translateX?: number;
};

export function ScaledTooltip({Icon, iconColor, iconSize = 20, iconSizeMax = 30, translateX = 4, ...props}: ScaledTooltipProps) {
    const scale = getFontScale();
    const scaledSize = iconSize + (iconSizeMax - iconSize) * (scale - 1);
    return <Tooltip trigger={<Icon size={scaledSize} color={iconColor} />} {...props} />;
}
