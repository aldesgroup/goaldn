import { useAtom } from "jotai";
import React from "react";
import { TouchableOpacity } from "react-native";
import { Txt } from "../../components/ui/txt";
import { cn } from "../cn";
import { isConnectedAtom } from "./BleConnectionAtoms";

export function BleConnectionWidget(props: { onPress?: () => void }) {
	const [isConnected] = useAtom(isConnectedAtom);

	return (
		<TouchableOpacity className="flex-row" onPress={props.onPress}>
			<Txt
				className={cn(
					"py-1 px-2",
					isConnected
						? "text-aldes-valid bg-aldes-valid-light"
						: "text-aldes-error bg-aldes-error-light"
				)}
			>
				{isConnected ? "Connected" : "Not connected"}
			</Txt>
		</TouchableOpacity>
	);
}
