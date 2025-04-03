import { Button, ButtonProps } from "../../components/ui/button";
import { BluetoothIcon } from "../icons";
import { Text } from "react-native";
import { cn } from "../cn";
import { Txt } from "../../components/ui/txt";

interface BleConnectionButtonProps {
	label?: string;
	buttonClass?: string;
	textClass?: string;
}

// @ts-ignor
export function BleConnectionButton({
	label = "Connect using Bluetooth",
	buttonClass,
	textClass,
	...props
}: BleConnectionButtonProps & ButtonProps) {
	return (
		<Button className={cn("flex-row gap-4", buttonClass)} {...props}>
			<Txt className={cn(textClass)}>{label}</Txt>
			<BluetoothIcon />
		</Button>
	);
}
