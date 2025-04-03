import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback } from "react";

// To use inside a stack navigator screen (current navigation), to hide the tab of the tab navigator (parent)
export function useHideTabBar() {
	const navigation = useNavigation();

	useFocusEffect(
		useCallback(() => {
			// Hide bottom tabs
			navigation.getParent()?.setOptions({ tabBarStyle: { display: "none" } });

			return () => {
				// Show bottom tabs again when exiting
				navigation.getParent()?.setOptions({ tabBarStyle: undefined });
			};
		}, [navigation])
	);
}
