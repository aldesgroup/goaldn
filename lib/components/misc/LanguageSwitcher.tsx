import {useAtom} from 'jotai';
import {Globe} from 'lucide-react-native';
import {TouchableOpacity} from 'react-native';
import Config from 'react-native-config';
import {getColors} from '../../styles/theme';
import {cn} from '../../utils/cn';
import {getLanguages, languageAtom} from '../../utils/i18n';
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
            {Config?.ENVIRONMENT && Config.ENVIRONMENT !== 'production' && (
                <Txt raw className={cn('pt-0.5 font-semibold uppercase', Config.ENVIRONMENT === 'development' ? 'text-teal-600' : 'text-orange-600')}>
                    {Config.ENVIRONMENT}
                </Txt>
            )}
            <Globe color={colors.foreground} />
            <Txt raw className="pt-0.5 font-semibold uppercase">
                {language}
            </Txt>
        </TouchableOpacity>
    );
}
