import { useAtom } from "jotai";
import React from "react";
import { Text, View } from "react-native";
import { connectedDeviceAtom, isConnectedAtom } from "./BleConnectionAtoms";
import { cn } from "../cn";

export function BleConnectionWidget() {
	const [isConnected] = useAtom(isConnectedAtom);
	const [connectedDevice] = useAtom(connectedDeviceAtom);

	return (
		<View className="flex-row">
			<Text
				className={cn(
					"py-1 px-2",
					isConnected
						? "text-aldes-valid bg-aldes-valid-light"
						: "text-aldes-error bg-aldes-error-light"
				)}
			>
				{isConnected ? "Connected: " + connectedDevice?.name : "Not connected"}
			</Text>
		</View>
	);
}
