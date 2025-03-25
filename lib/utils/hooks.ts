import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";

export function useHideTabBar() {
	const navigation = useNavigation();

	useEffect(() => {
		// Hide bottom tabs
		navigation.getParent()?.setOptions({ tabBarStyle: { display: "none" } });

		return () => {
			// Show bottom tabs again when exiting
			navigation.getParent()?.setOptions({ tabBarStyle: undefined });
		};
	}, [navigation]);
}
