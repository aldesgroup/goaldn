import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Tab = createBottomTabNavigator();

interface menuEntry {
	name: string;
	component: React.ComponentType<any>;
	options?: {
		short?: string;
	};
}

export interface MenuProps {
	entries: menuEntry[];
	menuClass?: string;
	entryClass?: string;
	labelClass?: string;
	activeClass?: string;
	onEntryClick?: () => void;
}

export function Navigator(props: { menu: MenuProps }) {
	return (
		<GestureHandlerRootView>
			<SafeAreaProvider>
				<NavigationContainer>
					<Tab.Navigator>
						{props.menu.entries.map((menuItem) => (
							<Tab.Screen
								key={menuItem.name}
								name={menuItem.name}
								component={menuItem.component}
							/>
						))}
					</Tab.Navigator>
				</NavigationContainer>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
}
