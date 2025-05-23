import AsyncStorage from '@react-native-async-storage/async-storage';
import {atom, useAtomValue, useSetAtom, WritableAtom} from 'jotai';
import {atomWithStorage, createJSONStorage} from 'jotai/utils';
import {useEffect} from 'react';
import {PixelRatio} from 'react-native';
import * as RNLocalize from 'react-native-localize';

//-----------------------------------------------------------------------------
// Utils
//-----------------------------------------------------------------------------
export function storedAtom<T>(key: string, defaultValue: T) {
    return atomWithStorage(
        key,
        defaultValue,
        createJSONStorage(() => AsyncStorage),
    );
}

//-----------------------------------------------------------------------------
// Language
//-----------------------------------------------------------------------------

export const deviceLng = RNLocalize.getLocales()[0].languageCode;
export const languageAtom = storedAtom('app-language', deviceLng);

//-----------------------------------------------------------------------------
// Display
//-----------------------------------------------------------------------------

export const detectSmallScreenAtom = storedAtom('detect-small-screen', true);
export const userSetSmallScreenAtom = storedAtom('user-set-small-screen', false);
export const detectFromScaleAtom = storedAtom('detect-from-scale', 1.3);
export const detectFromDensityAtom = storedAtom('detect-from-density', 2.75);

export const getFontScale = () => {
    return Math.round(100.0 * PixelRatio.getFontScale()) * 0.01;
};

export const getPixelDensity = () => {
    return Math.round(100.0 * PixelRatio.get()) * 0.01;
};

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
