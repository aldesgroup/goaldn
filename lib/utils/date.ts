import {useAtom} from 'jotai';
import {languageAtom} from '../settings';

const enShortDateFormatter = new Intl.DateTimeFormat('en', {month: '2-digit', day: '2-digit', year: 'numeric'});
const shortDateFormatter = new Intl.DateTimeFormat('fr', {month: '2-digit', day: '2-digit', year: 'numeric'});

/**
 * Hook that returns a date formatter function based on the current language setting.
 * Returns an English formatter if language is 'en', otherwise returns a French formatter.
 * @returns {Function} A function that formats dates in the format 'MM/DD/YYYY' for English or 'DD/MM/YYYY' for French.
 * @category Utils
 */
export const useDateFormatter = () => {
    const [language] = useAtom(languageAtom);

    if (language === 'en') {
        return enShortDateFormatter.format;
    }

    return shortDateFormatter.format;
};
