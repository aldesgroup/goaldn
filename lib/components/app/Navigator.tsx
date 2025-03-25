import { ScreensConfig } from "tailwindcss/types/config";
import { Txt } from "../ui/txt";
import { MenuProps, ScreensProps } from "./Navigator-utils";
import { Platform } from "react-native";

export function MainNavigator(props: { menu: MenuProps }) {
	return <Txt>Not implemented on this {Platform.OS} platform!</Txt>;
}

export function ScreenNavigator(screens: ScreensProps) {
	return <Txt>Not implemented on this {Platform.OS} platform!</Txt>;
}
