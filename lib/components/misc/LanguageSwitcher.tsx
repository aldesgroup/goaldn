import {useAtom} from 'jotai';
import {TouchableOpacity, View} from 'react-native';
import {getColors} from '../../styles/theme';
import {getLanguages, languageAtom} from '../../utils/i18n';
import {Globe} from 'lucide-react-native';
import {Txt} from '../ui/custom/txt';

export function LanguageSwitcher() {
    // shared state
    const [language, setLanguage] = useAtom(languageAtom);
    const languages = getLanguages();
    const colors = getColors();

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
            <Globe color={colors.foreground} />
            <Txt raw className="pt-0.5 font-semibold uppercase">
                {language}
            </Txt>
        </TouchableOpacity>
    );
}
