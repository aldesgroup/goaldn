import { MenuProps } from "./Navigator-utils";
import { Text, Platform } from "react-native";

export function Navigator(props: { menu: MenuProps }) {
	return <Text>Not implemented on this {Platform.OS} platform!</Text>;
}
