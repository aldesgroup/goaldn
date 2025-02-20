import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MenuProps } from "./Navigator-utils";

const BottomTab = createBottomTabNavigator();

// Hides warning when Strict Mode is active, in dev mode
LogBox.ignoreLogs(["findHostInstance_DEPRECATED"]);

export function Navigator(props: { menu: MenuProps }) {
	return (
		<GestureHandlerRootView>
			<SafeAreaProvider>
				<NavigationContainer>
					<BottomTab.Navigator>
						{props.menu.entries.map((menuItem) => (
							<BottomTab.Screen
								key={menuItem.name}
								name={menuItem.name}
								component={menuItem.component}
								options={{
									tabBarIcon: menuItem.icon && menuItem.icon,
									headerShown: !menuItem.isStack,
								}}
							/>
						))}
					</BottomTab.Navigator>
				</NavigationContainer>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
}
