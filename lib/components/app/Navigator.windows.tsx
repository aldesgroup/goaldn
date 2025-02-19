import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MenuProps } from "./Navigator-utils";

const Sidebar = createDrawerNavigator();

export function Navigator(props: { menu: MenuProps }) {
	return (
		<NavigationContainer>
			<SafeAreaProvider>
				<Sidebar.Navigator
					screenOptions={{
						drawerType: "permanent", // Always visible
						drawerStyle: { width: 250 }, // Sidebar width
					}}
				>
					{props.menu.entries.map((menuItem) => (
						<Sidebar.Screen
							key={menuItem.name}
							name={menuItem.name}
							component={menuItem.component}
							options={{
								drawerIcon: menuItem.icon && menuItem.icon,
								// tabBarIcon: menuItem.icon && menuItem.icon,
							}}
						/>
					))}
				</Sidebar.Navigator>
			</SafeAreaProvider>
		</NavigationContainer>
	);
}
