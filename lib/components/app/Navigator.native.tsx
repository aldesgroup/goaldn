import { BottomTabNavigationProp, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
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
	// shared state
	const navigation = useNavigation<BottomTabNavigationProp<any>>();

	// utils
	const translate = useTranslator();

	// effects

	// view
	return (
		<BottomTab.Navigator>
			{props.menu.entries.map((menuItem, index) => {
				const { translation, missing } = translate(menuItem.name);

				return (
					<BottomTab.Screen
						key={menuItem.name}
						name={menuItem.name}
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
			{screens.items.map((screen, index) => {
				const getHeaderTitle = (props: { navigation: any; route: any }): string => {
					const options = screen.options && screen.options(props);
					return (
						options?.headerTitle?.toString() ||
						options?.title?.toString() ||
						screen.name
					);
				};

				const getOptions = (props: {
					navigation: any;
					route: any;
				}): NativeStackNavigationOptions => {
					const baseOptions = (screen.options && screen.options(props)) || {};
					const headerTitle = getHeaderTitle(props);
					const { translation, missing } = translate(headerTitle);

					return {
						...baseOptions,
						headerTitle: translation,
						headerTintColor: (missing && "red") || "black",
					};
				};

				return (
					<Stack.Screen
						name={(index === 0 ? "_" : "") + screen.name}
						//@ts-ignore
						component={screen.component}
						options={getOptions}
						key={screen.name}
					/>
				);
			})}
		</Stack.Navigator>
	);
}
