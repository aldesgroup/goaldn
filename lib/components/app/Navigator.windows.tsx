import {
	createDrawerNavigator,
	DrawerContentComponentProps,
	DrawerContentScrollView,
	DrawerItemList,
} from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MenuProps } from "./Navigator-utils";
import { Text } from "react-native";

const Sidebar = createDrawerNavigator();

const CustomDrawerContent = (props: { menu: MenuProps } & any) => (
	<DrawerContentScrollView {...props}>
		{/* 🔥 LOGO AT THE TOP - if any */}
		{props.menu.windows?.logo && <props.menu.windows.logo />}

		{/* Drawer Items */}
		<DrawerItemList {...props} />
	</DrawerContentScrollView>
);

export function Navigator(menuProps: { menu: MenuProps }) {
	return (
		<NavigationContainer>
			<SafeAreaProvider>
				<Sidebar.Navigator
					drawerContent={(props: DrawerContentComponentProps) => (
						<CustomDrawerContent {...props} menu={menuProps.menu} />
					)} // 🔥 Custom Drawer with Logo
					screenOptions={{
						drawerType: "permanent", // Always visible
						drawerStyle: { width: 250 }, // Sidebar width
						headerLeft: () => null,
						drawerActiveBackgroundColor: "#DCECFF", // Active item color (change as needed)
						drawerActiveTintColor: "#2A4AFB", // Active item text color
						drawerItemStyle: {
							borderRadius: 0,
							margin: 0,
							height: 56,
						},
					}}
				>
					{menuProps.menu.entries.map((menuItem) => (
						<Sidebar.Screen
							key={menuItem.name}
							name={menuItem.name}
							component={menuItem.component}
							options={{
								drawerIcon: menuItem.icon && menuItem.icon,
							}}
						/>
					))}
				</Sidebar.Navigator>
			</SafeAreaProvider>
		</NavigationContainer>
	);
}
