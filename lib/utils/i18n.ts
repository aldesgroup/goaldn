import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import i18n from "i18next";
import { useAtom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { useEffect } from "react";
import { initReactI18next } from "react-i18next";
import * as RNLocalize from "react-native-localize";

const deviceLng = RNLocalize.getLocales()[0].languageCode;

export const languageAtom = atomWithStorage(
	"app-language",
	deviceLng,
	createJSONStorage(() => AsyncStorage)
);

export const initI18n = async (resources: Record<string, any>) => {
	i18n.use(initReactI18next).init({
		lng: deviceLng,
		fallbackLng: deviceLng,
		ns: ["Common"], // Default namespace
		defaultNS: "Common", // Default namespace
		interpolation: { escapeValue: false },
		resources: resources,
	});
};

export const getLanguages = () => {
	const translationLanguages =
		(i18n.options.resources && Object.keys(i18n.options.resources)) || [];
	translationLanguages.push("en");
	return translationLanguages;
};

function keyFromLabel(label: string, max: number) {
	// If the string is already within the max length, return it as is
	if (label.length <= max) {
		return label;
	}

	// Finding the place where to cut the string, starting from the end
	let cutIndex = 0;
	for (let i = max; i > 0; i--) {
		if (label[i] === " ") {
			cutIndex = i;
			break;
		}
	}

	// If no space is found, cut at the maximum size
	if (cutIndex === 0) {
		cutIndex = max;
	}

	// Return the substring up to the cut index
	return label.slice(0, cutIndex);
}

// Helper function to recursively check parent routes for a translation
const translateKeyAtRoutes = (language: string, label: string, routes?: string[]) => {
	// We do not translate english since we're coding in english
	if (language && language.startsWith("en")) {
		return { translation: label, missing: false };
	}

	// Attempt to translate using the current path as the namespace
	let translation = "";

	// Making a key from the label
	const key = keyFromLabel(label, 48); // TODO! Env var to set here, driven by Aldev

	// Testing the label with current route, or one of its parents
	if (routes) {
		for (let i = routes.length - 1; i >= 0; i--) {
			// what's the current namespace?
			let ns = routes[i];
			ns[0] === "_" && (ns = ns.slice(1));

			// trying to get the translation for the current namespace
			translation = i18n.t(key, { lng: language, ns: ns, defaultValue: "" });

			// Quitting the loop if we've found a translation!
			if (translation !== "") {
				break;
			}
		}
	}

	// The ultimate parent being the "common" route
	if (translation === "") {
		translation = i18n.t(key, { lng: language, ns: "Common", defaultValue: "" });
	}

	// This is how we'll deal with missing translation
	const missing = translation === "";
	if (missing) {
		translation = "(" + label + ")";
	}

	return { translation, missing };
};

// Makes sure the value of the language atom - which is locally stored - applies to the i18n instance
export function useInitAndSyncLanguage() {
	const [language] = useAtom(languageAtom);

	useEffect(() => {
		if (i18n.language !== language) {
			i18n.changeLanguage(language).catch(console.error);
		}
	}, [language]);
}

// main translating function hook

/**
 * @returns a translation function that returns the translation found for the current language and route,
 * else it returns the provided key
 */
export const useTranslator = () => {
	const navigation = useNavigation();
	const [language] = useAtom(languageAtom);

	const translate = (label: string) => {
		const state = navigation.getState();

		if (state && state.type === "tab") {
			// if we're viewing a screen that's not part of a stack, but directly on the menu
			return translateKeyAtRoutes(language, label, [state.routeNames[state.index]]);
		}

		return translateKeyAtRoutes(language, label, state?.routeNames);
	};

	return translate;
};
