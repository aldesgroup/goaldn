import {useAtom} from 'jotai';
import {languageAtom} from '../settings';

// ----------------------------------------------------------------------------
// Date formatting
// ----------------------------------------------------------------------------

const shortDateFormatter = new Intl.DateTimeFormat('fr', {month: '2-digit', day: '2-digit', year: 'numeric'});
const dateFormatter = new Intl.DateTimeFormat('fr', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
});
const enShortDateFormatter = new Intl.DateTimeFormat('en', {month: '2-digit', day: '2-digit', year: 'numeric'});
const enDateFormatter = new Intl.DateTimeFormat('en', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
});

/**
 * Hook that returns a date formatter function based on the current language setting.
 * Returns an English formatter if language is 'en', otherwise returns a French formatter.
 * @returns {Function} A function that formats dates in the format 'MM/DD/YYYY' for English or 'DD/MM/YYYY' for French.
 * @category Utils
 */
export const useDateFormatter = (withTime?: boolean) => {
    const [language] = useAtom(languageAtom);

    if (language === 'en') {
        return withTime ? enDateFormatter.format : enShortDateFormatter.format;
    }

    return withTime ? dateFormatter.format : shortDateFormatter.format;
};

// ----------------------------------------------------------------------------
// Time formatting
// ----------------------------------------------------------------------------

const onlyTimeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
});

/**
 * Returns the given date in the HH:MM:SS.sss format
 * @param date
 * @returns
 * @category Utils
 */
export const toMillisecondsString = (date: Date) => {
    return onlyTimeFormatter.format(date) + '.' + date.getMilliseconds().toString().padStart(3, '0');
};

// ----------------------------------------------------------------------------
// Misc
// ----------------------------------------------------------------------------

/**
 * Sleep function. Use it like this: await sleep(timeInMilliseconds)
 * @param ms the time to sleep
 * @returns
 */
export function sleep(ms: number) {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
}
