import { RouteConfigComponent } from "@react-navigation/native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { OptionFunction } from "./Navigator-options";

interface menuEntry {
	name: string;
	component: React.ComponentType<any>;
	icon?: (props: { size: number; color: string }) => React.ReactNode;
}

interface menuWindowsConfig {
	logo?: () => React.ReactNode;
}

export interface MenuProps {
	entries: menuEntry[];
	windows?: menuWindowsConfig;
}

interface screenItemProps {
	name: string;
	component: RouteConfigComponent<any, any>;
	options: OptionFunction;
}

export interface ScreensProps {
	navigation: any;
	items: screenItemProps[];
}
