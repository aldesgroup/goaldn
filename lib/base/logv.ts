import {useAtomValue} from 'jotai';
import {toMillisecondsString} from '../utils';
import {verboseAtom} from '../settings';
import {useCallback} from 'react';

/**
 * This hooks returns a function that logs only if the verbose mode has been activated
 * @param prefix a prefix that should be used to identify each log lines
 * @param message
 * @param optionalParams
 * @category Base
 */
export const useLogV = (prefix: string) => {
    const verbose = useAtomValue(verboseAtom);

    // useCallback: avoids recreating the function, unless verbose or the prefix changes
    return useCallback(
        (message?: any, ...optionalParams: any[]) => {
            if (verbose) {
                console.log(toMillisecondsString(new Date()), '[' + prefix + ']', message, ...optionalParams);
            }
        },
        [verbose, prefix],
    );
};

/**
 * Returns a function that formats then logs a message with parameters, with a date and a chosen prefix
 * @param verbose are we in verbose mode?
 * @param prefix  a prefix to identify the log line
 * @category Base
 */
export const getLogV = (verbose: boolean, prefix: string) => {
    return (message?: any, ...optionalParams: any[]) => {
        if (verbose) {
            console.log(toMillisecondsString(new Date()), '[' + prefix + ']', message, ...optionalParams);
        }
    };
};
