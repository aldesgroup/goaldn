import {Button, ButtonProps} from '../../components/ui/custom/button-pimped';
import {Txt} from '../../components/ui/custom/txt';
import {cn} from '../cn';
import {Bluetooth} from 'lucide-react-native';

/**
 * Props for the BleConnectionButton component.
 * @property {string} [label] - The text to display on the button. Defaults to 'Connect using Bluetooth'.
 * @property {string} [buttonClass] - Additional CSS classes for the button container.
 * @property {string} [textClass] - Additional CSS classes for the button text.
 */
interface BleConnectionButtonProps {
    label?: string;
    buttonClass?: string;
    textClass?: string;
}

/**
 * A button component for initiating Bluetooth connections.
 * Displays a Bluetooth icon and customizable text label.
 * @param {BleConnectionButtonProps & ButtonProps} props - The component props.
 * @returns {JSX.Element} A button component with Bluetooth icon and text.
 */
export function BleConnectionButton({label = 'Connect using Bluetooth', buttonClass, textClass, ...props}: BleConnectionButtonProps & ButtonProps) {
    return (
        <Button className={cn('flex-row gap-4', buttonClass)} {...props}>
            <Txt className={cn('flex-1', textClass)}>{label}</Txt>
            <Bluetooth color={'white'} size={18} />
        </Button>
    );
}
