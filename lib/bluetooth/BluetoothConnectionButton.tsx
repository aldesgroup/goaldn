import {Bluetooth} from 'lucide-react-native';
import {Button, ButtonProps, cn, Txt} from '../base';

/**
 * Props for the BluetoothConnectionButton component.
 * @category Types
 */
export type BluetoothConnectionButtonProps = {
    /** The text to display on the button. Defaults to 'Connect using Bluetooth'. */
    label?: string;
    /** Additional CSS classes for the button container. */
    buttonClass?: string;
    /** Additional CSS classes for the button text. */
    textClass?: string;
};

/**
 * A button component for initiating Bluetooth connections.
 * Displays a Bluetooth icon and customizable text label.
 * @param {BluetoothConnectionButtonProps & ButtonProps} props - The component props.
 * @returns {JSX.Element} A button component with Bluetooth icon and text.
 * @category Bluetooth
 */
export function BluetoothConnectionButton({
    label = 'Connect using Bluetooth',
    buttonClass,
    textClass,
    ...props
}: BluetoothConnectionButtonProps & ButtonProps) {
    return (
        <Button className={cn('flex-row gap-4', buttonClass)} {...props}>
            <Txt className={cn('flex-1', textClass)}>{label}</Txt>
            <Bluetooth color={'white'} size={18} />
        </Button>
    );
}
