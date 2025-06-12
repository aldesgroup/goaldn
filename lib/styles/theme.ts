/**
 * The themeColors object defines the color palette used throughout the application.
 * All color values are initialized to a default value and can be updated at runtime.
 */
const themeColors = {
    foreground: '#FF0077',
    foregroundLight: '#FF0077',
    primary: '#FF0077',
    primaryLight: '#FF0077',
    primaryForeground: '#FF0077',
    destructive: '#FF0077',
    destructiveDarker: '#FF0077',
    destructiveForeground: '#FF0077',
    secondary: '#FF0077',
    secondaryDarker: '#FF0077',
    secondaryForeground: '#FF0077',
    muted: '#FF0077',
    mutedForeground: '#FF0077',
    input: '#FF0077',
    border: '#FF0077',
    background: '#FF0077',
    infoLight: '#FF0077',
    info: '#FF0077',
    infoForeground: '#FF0077',
    warningForeground: '#FF0077',
    errorForeground: '#FF0077',
};

/**
 * Type representing the structure of the themeColors object.
 */
export type colorsType = typeof themeColors;

/**
 * Initializes or updates the application's theme colors.
 * This function mutates the themeColors object and freezes it to prevent further changes.
 *
 * @param colors - An object containing the new color values for the theme
 */
export const initThemeColors = (colors: colorsType) => {
    themeColors.foreground = colors.foreground;
    themeColors.foregroundLight = colors.foregroundLight;
    themeColors.primary = colors.primary;
    themeColors.primaryLight = colors.primaryLight;
    themeColors.primaryForeground = colors.primaryForeground;
    themeColors.destructive = colors.destructive;
    themeColors.destructiveDarker = colors.destructiveDarker;
    themeColors.destructiveForeground = colors.destructiveForeground;
    themeColors.secondary = colors.secondary;
    themeColors.secondaryDarker = colors.secondaryDarker;
    themeColors.secondaryForeground = colors.secondaryForeground;
    themeColors.muted = colors.muted;
    themeColors.mutedForeground = colors.mutedForeground;
    themeColors.input = colors.input;
    themeColors.border = colors.border;
    themeColors.background = colors.background;
    themeColors.infoLight = colors.infoLight;
    themeColors.info = colors.info;
    themeColors.infoForeground = colors.infoForeground;
    themeColors.warningForeground = colors.warningForeground;
    themeColors.errorForeground = colors.errorForeground;
    Object.freeze(themeColors);
};

/**
 * Returns the current theme colors used in the application.
 *
 * @returns The current colorsType object representing the theme colors
 */
export const getColors: () => colorsType = () => themeColors;
