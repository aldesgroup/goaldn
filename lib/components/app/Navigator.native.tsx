import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import {
	createNativeStackNavigator,
	NativeStackNavigationOptions,
} from "@react-navigation/native-stack";
import React from "react";
import { LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useInitAndSyncLanguage, useTranslator } from "../../utils/i18n";
import { MenuProps, ScreensProps } from "./Navigator-utils";

// ------------------------------------------------------------------------------------------------
// --- Global navigation
// ------------------------------------------------------------------------------------------------

const BottomTab = createBottomTabNavigator();

// Hides warning when Strict Mode is active, in dev mode
LogBox.ignoreLogs(["findHostInstance_DEPRECATED"]);

function MenuNavigator(props: { menu: MenuProps }) {
	// utils
	const translate = useTranslator();

	return (
		<BottomTab.Navigator>
			{props.menu.entries.map((menuItem) => {
				const { translation, missing } = translate(menuItem.name);

				return (
					<BottomTab.Screen
						key={menuItem.name}
						name={"Menu:" + menuItem.name}
						component={menuItem.component}
						options={{
							tabBarIcon: menuItem.icon && menuItem.icon,
							headerShown: false,
							title: translation,
							tabBarLabelStyle: missing && { color: "red" },
							headerTitle: translation,
							headerTintColor: (missing && "red") || "black",
						}}
					/>
				);
			})}
		</BottomTab.Navigator>
	);
}

export function MainNavigator(props: { menu: MenuProps }) {
	// effects
	useInitAndSyncLanguage();

	// view
	return (
		<GestureHandlerRootView>
			<SafeAreaProvider>
				<NavigationContainer>
					<MenuNavigator menu={props.menu} />
				</NavigationContainer>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
}

// ------------------------------------------------------------------------------------------------
// --- Navigation from 1 menu entry
// ------------------------------------------------------------------------------------------------

export function ScreenNavigator(screens: ScreensProps) {
	const Stack = createNativeStackNavigator();
	const translate = useTranslator();
	return (
		<Stack.Navigator>
			{screens.items.map((screen) => {
				const { translation, missing } = translate(screen.name);
				const options = {
					...(screen.options || ({} as NativeStackNavigationOptions)),
					headerTitle: translation,
					headerTintColor: (missing && "red") || "black",
					headerRight: screen.headerRight,
				} as NativeStackNavigationOptions;
				return (
					<Stack.Screen
						name={screen.name}
						//@ts-ignore
						component={screen.component}
						options={options}
						key={screen.name}
					/>
				);
			})}
		</Stack.Navigator>
	);
}
