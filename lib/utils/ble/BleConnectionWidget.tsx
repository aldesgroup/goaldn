import { useAtom } from "jotai";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { connectedDeviceAtom, isConnectedAtom } from "./BleConnectionAtoms";
import { cn } from "../cn";

export function BleConnectionWidget(props: { onPress?: () => void }) {
	const [isConnected] = useAtom(isConnectedAtom);

	return (
		<TouchableOpacity className="flex-row" onPress={props.onPress}>
			<Text
				className={cn(
					"py-1 px-2",
					isConnected
						? "text-aldes-valid bg-aldes-valid-light"
						: "text-aldes-error bg-aldes-error-light"
				)}
			>
				{isConnected ? "Connected" : "Not connected"}
			</Text>
		</TouchableOpacity>
	);
}
