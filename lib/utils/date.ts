import {useAtom} from 'jotai';
import {languageAtom} from './settings';

const enShortDateFormatter = new Intl.DateTimeFormat('en', {month: '2-digit', day: '2-digit', year: 'numeric'});
const shortDateFormatter = new Intl.DateTimeFormat('fr', {month: '2-digit', day: '2-digit', year: 'numeric'});

export const useDateFormatter = () => {
    const [language] = useAtom(languageAtom);

    if (language === 'en') {
        return enShortDateFormatter.format;
    }

    return shortDateFormatter.format;
};
