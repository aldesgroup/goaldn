import { TouchableOpacity, View } from "react-native";
import { getLanguages, languageAtom } from "../../utils/i18n";
import { useAtom } from "jotai";
import { Txt } from "../ui/txt";
import { WorldIcon } from "../../utils/icons";

export function LanguageSwitcher() {
	// shared state
	const [language, setLanguage] = useAtom(languageAtom);
	const languages = getLanguages();

	// local state

	// utils
	const handleSwitch = () => {
		const index = languages.indexOf(language);
		if (index >= 0) {
			const newLanguage = languages[(index + 1) % languages.length];
			setLanguage(newLanguage);
		}
	};

	// view
	return (
		<TouchableOpacity className="flex flex-row gap-2" onPress={handleSwitch}>
			<WorldIcon />
			<Txt raw className="uppercase font-semibold pt-0.5">
				{language}
			</Txt>
		</TouchableOpacity>
	);
}
