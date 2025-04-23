import {Button, ButtonProps} from '../../components/ui/custom/button-pimped';
import {Txt} from '../../components/ui/custom/txt';
import {cn} from '../cn';
import {Bluetooth} from 'lucide-react-native';

interface BleConnectionButtonProps {
    label?: string;
    buttonClass?: string;
    textClass?: string;
}

// @ts-ignor
export function BleConnectionButton({label = 'Connect using Bluetooth', buttonClass, textClass, ...props}: BleConnectionButtonProps & ButtonProps) {
    return (
        <Button className={cn('flex-row gap-4', buttonClass)} {...props}>
            <Txt className={cn(textClass)}>{label}</Txt>
            <Bluetooth color={'white'} size={18} />
        </Button>
    );
}
