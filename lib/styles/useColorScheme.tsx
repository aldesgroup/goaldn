import {useColorScheme as useNativewindColorScheme} from 'nativewind';

/**
 * Custom hook that provides the current color scheme and utilities to change it.
 * Wraps the nativewind useColorScheme hook and ensures a default of 'dark'.
 *
 * @returns An object containing:
 *   - colorScheme: The current color scheme ('light' or 'dark')
 *   - isDarkColorScheme: Boolean indicating if the scheme is dark
 *   - setColorScheme: Function to set the color scheme
 *   - toggleColorScheme: Function to toggle between light and dark
 */
export function useColorScheme() {
    const {colorScheme, setColorScheme, toggleColorScheme} = useNativewindColorScheme();
    return {
        colorScheme: colorScheme ?? 'dark',
        isDarkColorScheme: colorScheme === 'dark',
        setColorScheme,
        toggleColorScheme,
    };
}
