const themeColors = {
    foreground: '#FF0077',
    primary: '#FF0077',
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
};

type colorsType = typeof themeColors;

export const initThemeColors = (colors: colorsType) => {
    console.log('setting the colors');
    themeColors.foreground = colors.foreground;
    themeColors.primary = colors.primary;
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
    Object.freeze(themeColors);
};

export const getColors: () => colorsType = () => themeColors;
