import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { TouchableOpacity } from "react-native";
import { CloseIcon } from "../../utils/icons";
import { LanguageSwitcher } from "../misc";

// Signature for option functions
export type OptionFunction = ({ navigation }: { navigation: any }) => NativeStackNavigationOptions;

// Function to combine multiple OptionFunction functions
export const CombineOptions = (...optionFunctions: OptionFunction[]): OptionFunction => {
	return ({ navigation }) => {
		return optionFunctions.reduce((combinedOptions, optionFunction) => {
			return { ...combinedOptions, ...optionFunction({ navigation }) };
		}, {});
	};
};

// Shows in the header a X icon on the right to close the current screen, hiding the back arrow
export const CloseIconOption =
	(backToRoot?: boolean) =>
	({ navigation }: { navigation: any }) => ({
		// to differ from "normal" navigation (slide-in effect, with back arrow)
		headerRight: () => (
			<TouchableOpacity
				className=""
				onPress={() => (backToRoot ? navigation.popToTop() : navigation.goBack())}
			>
				<CloseIcon color="#081061" />
			</TouchableOpacity>
		),
		headerBackVisible: false,
	});

// Display the language switcher component in the header on the right
export const LanguageSwitcherOption = ({ navigation }: { navigation: any }) => ({
	headerRight: LanguageSwitcher,
});

// Allows to change the title, an optionally to display the X close icon
export const TitleOption = (
	title: string,
	withCloseIcon?: boolean,
	backToRoot?: boolean
): OptionFunction => {
	const baseTitleOption = ({ navigation }: { navigation: any }) => ({ title: title });
	return withCloseIcon
		? CombineOptions(baseTitleOption, CloseIconOption(backToRoot))
		: baseTitleOption;
};
