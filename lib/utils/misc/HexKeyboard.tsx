import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { cn } from "../cn";

/**
 * HexKeyboard - A reusable component for inputting hexadecimal characters using NativeWind
 *
 * @param {Object} props
 * @param {function} props.onKeyPress - Function called when a key is pressed, receives the pressed character
 * @param {function} props.onDelete - Function called when delete button is pressed
 * @param {function} props.onClear - Function called when clear button is pressed
 * @param {string} props.containerClass - Additional classes for the keyboard container
 * @param {string} props.keyClass - Additional classes for individual keys
 * @param {string} props.keyTextClass - Additional classes for key text
 * @param {string} props.controlKeyClass - Additional classes for control keys
 */
export function HexKeyboard(props: {
	onKeyPress: (key: string) => void;
	containerClass?: string;
	keyClass?: string;
	keyTextClass?: string;
}) {
	// Hexadecimal characters
	const keys = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];

	return (
		<View className={cn("flex-row flex-wrap w-80 h-80 bg-slate-300 p-4", props.containerClass)}>
			{keys.map((key) => (
				<TouchableOpacity
					key={key}
					className={cn(
						// isLandscape ? "w-1/12" : "w-1/5",
						"w-16 h-16",
						"aspect-square bg-white justify-center items-center m-1",
						props.keyClass
					)}
					onPress={() => props.onKeyPress(key)}
					activeOpacity={0.3}
				>
					<Text className={cn("text-xl font-bold text-slate-400", props.keyTextClass)}>
						{key}
					</Text>
				</TouchableOpacity>
			))}
		</View>
	);
}
