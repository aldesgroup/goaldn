import {atom, WritableAtom} from 'jotai';
import {PixelRatio} from 'react-native';
import * as RNLocalize from 'react-native-localize';
import {storedAtom} from '../state-management';

//-----------------------------------------------------------------------------
// Language
//-----------------------------------------------------------------------------

/**
 * Retrieves the device's language code from the first locale.
 * @category Settings
 */
export const deviceLng = RNLocalize.getLocales()[0].languageCode;

/**
 * Atom that stores the application's language setting.
 * @category Settings
 */
export const languageAtom = storedAtom('app-language', deviceLng);

//-----------------------------------------------------------------------------
// Display
//-----------------------------------------------------------------------------

/**
 * Atom that determines whether to detect a small screen based on font scale and pixel density.
 * @category Settings
 */
export const detectSmallScreenAtom = storedAtom('detect-small-screen', true);

/**
 * Atom that stores the user's manual setting for small screen detection.
 * @category Settings
 */
export const userSetSmallScreenAtom = storedAtom('user-set-small-screen', false);

/**
 * Atom that stores the threshold for font scale to detect a small screen.
 * @category Settings
 */
export const detectFromScaleAtom = storedAtom('detect-from-scale', 1.3);

/**
 * Atom that stores the threshold for pixel density to detect a small screen.
 * @category Settings
 */
export const detectFromDensityAtom = storedAtom('detect-from-density', 3.0);

/**
 * Returns the current font scale of the device.
 * @returns {number} The font scale value.
 * @category Settings
 */
export const getFontScale = () => {
    return Math.round(100.0 * PixelRatio.getFontScale()) * 0.01;
};

/**
 * Returns the current pixel density of the device.
 * @returns {number} The pixel density value.
 * @category Settings
 */
export const getPixelDensity = () => {
    return Math.round(100.0 * PixelRatio.get()) * 0.01;
};

/**
 * Atom that determines if the screen is considered small based on font scale and pixel density.
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating if the screen is small.
 * @category Settings
 */
export const smallScreenAtom: WritableAtom<boolean | Promise<boolean>, any, any> = atom(
    async get => {
        const detect = await get(detectSmallScreenAtom); // we have a Promise here, after all
        const userSetSmallScreen = await get(userSetSmallScreenAtom);
        const fontScale = getFontScale();
        const scaleThreshold = (await get(detectFromScaleAtom)) as number;
        const pixelDensity = getPixelDensity();
        const densityThreshold = (await get(detectFromDensityAtom)) as number;

        if (detect) {
            return fontScale >= scaleThreshold || pixelDensity >= densityThreshold;
        } else {
            return userSetSmallScreen;
        }
    },
    (get, set, newValue: boolean) => {
        // we don't provide a write method here, it's a purely derived atom
    },
);
