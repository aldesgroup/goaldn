import type {Config} from 'tailwindcss';
import {fontFamily} from 'tailwindcss/defaultTheme';
import plugin from 'tailwindcss/plugin';
import animatePlugin from 'tailwindcss-animate';
import type {colorsType} from './theme';

// setting the colors here for 2 purposes:
// - to build the exported theme here, which is used at build time
// - to initialise the same theme colors for use by some GoaldN components
// This means this file has to be imported in the tailwind config of a native app (build time)...
// ... AND in the app itself, to be passed to GoaldN's initThemeColors function (runtime)
export const devotionColors: colorsType = {
    foreground: '#1122AA',
    foregroundLight: '#1199FF',
    primary: '#1155FF',
    primaryLight: '#CCDDFF',
    primaryForeground: '#FFFFFF',
    destructive: '#FFEEEE',
    destructiveDarker: '#FFCCCC',
    destructiveForeground: '#FF6666',
    secondary: '#EEEEFF',
    secondaryDarker: '#CCCCFF',
    secondaryForeground: '#6666FF',
    muted: '#AAAAAA',
    mutedForeground: '#777777',
    input: '#666666',
    border: '#BBBBBB',
    background: '#F4F4FF',
    infoLight: '#BBFFBB',
    info: '#88FF88',
    infoForeground: '#11BB11',
    warningForeground: '#FF7711',
    errorForeground: '#FF0000',
};

const devotionPlugin = plugin(
    // CSS variable definitions for the base layer
    function ({addBase}) {
        addBase({
            ':root': {
                // passing the colors to Tailwind
                '--foreground': devotionColors.foreground,
                '--foreground-light': devotionColors.foregroundLight,
                '--primary': devotionColors.primary,
                '--primary-light': devotionColors.primaryLight,
                '--primary-foreground': devotionColors.primaryForeground,
                '--destructive': devotionColors.destructive,
                '--destructive-darker': devotionColors.destructiveDarker,
                '--destructive-foreground': devotionColors.destructiveForeground,
                '--secondary': devotionColors.secondary,
                '--secondary-darker': devotionColors.secondaryDarker,
                '--secondary-foreground': devotionColors.secondaryForeground,
                '--muted': devotionColors.muted,
                '--muted-foreground': devotionColors.mutedForeground,
                '--input': devotionColors.input,
                '--border': devotionColors.border,
                '--background': devotionColors.background,
                '--info-light': devotionColors.infoLight,
                '--info': devotionColors.info,
                '--info-foreground': devotionColors.infoForeground,
                '--warning-foreground': devotionColors.warningForeground,
                '--error-foreground': devotionColors.errorForeground,

                '--radius': '0.5rem',

                '--ring': '#FF0066',
                '--card': '#FF0066',
                '--card-foreground': '#FF0066',
                '--popover': '#FF0066',
                '--popover-foreground': '#FF0066',
                '--accent': '#FF0066',
                '--accent-foreground': '#FF0066',
            },
        });

        addBase({
            '*': {
                '@apply border-border': {},
            },
            body: {
                '@apply bg-background text-foreground': {},
                'font-feature-settings': '"rlig" 1, "calt" 1',
            },
        });
    },

    // extending the Tailwind theme with "themeable" utilities
    {
        theme: {
            // override to set desktop-first mode, which is not Tailwind's default
            // screens: {
            //     "2xl": { max: "1535px" }, // => @media (max-width: 1535px) { ... }
            //     xl: { max: "1279px" }, // => @media (max-width: 1279px) { ... }
            //     lg: { max: "1023px" }, // => @media (max-width: 1023px) { ... }
            //     md: { max: "767px" }, // => @media (max-width: 767px) { ... }
            //     sm: { max: "639px" }, // => @media (max-width: 639px) { ... }
            // },
            // container: {
            //     center: true,
            //     padding: "2rem",
            //     screens: {
            //         "2xl": "1400px",
            //     },
            // },
            extend: {
                colors: {
                    border: 'var(--border)',
                    input: 'var(--input)',
                    ring: 'var(--ring)',
                    background: 'var(--background)',
                    foreground: {
                        DEFAULT: 'var(--foreground)',
                        light: 'var(--foreground-light)',
                    },
                    primary: {
                        DEFAULT: 'var(--primary)',
                        foreground: 'var(--primary-foreground)',
                        light: 'var(--primary-light)',
                    },
                    secondary: {
                        DEFAULT: 'var(--secondary)',
                        foreground: 'var(--secondary-foreground)',
                        darker: 'var(--secondary-darker)',
                    },
                    destructive: {
                        DEFAULT: 'var(--destructive)',
                        foreground: 'var(--destructive-foreground)',
                        darker: 'var(--destructive-darker)',
                    },
                    muted: {
                        DEFAULT: 'var(--muted)',
                        foreground: 'var(--muted-foreground)',
                    },
                    accent: {
                        DEFAULT: 'var(--accent)',
                        foreground: 'var(--accent-foreground)',
                    },
                    popover: {
                        DEFAULT: 'var(--popover)',
                        foreground: 'var(--popover-foreground)',
                    },
                    card: {
                        DEFAULT: 'var(--card)',
                        foreground: 'var(--card-foreground)',
                    },
                    info: {
                        DEFAULT: 'var(--info)',
                        light: 'var(--info-light)',
                        foreground: 'var(--info-foreground)',
                    },
                    warning: {
                        foreground: 'var(--warning-foreground)',
                    },
                    error: {
                        foreground: 'var(--error-foreground)',
                    },
                },
                fontFamily: {
                    mono: ['var(--font-mono)', ...fontFamily.mono],
                    sans: ['"Roboto"', ...fontFamily.sans],
                },
                borderRadius: {
                    lg: 'var(--radius)',
                    md: 'calc(var(--radius) - 2px)',
                    sm: 'calc(var(--radius) - 4px)',
                },
                keyframes: {
                    'accordion-down': {
                        from: {height: '0'},
                        to: {height: 'var(--radix-accordion-content-height)'},
                    },
                    'accordion-up': {
                        from: {
                            height: 'var(--radix-accordion-content-height)',
                        },
                        to: {height: '0'},
                    },
                },
                animation: {
                    'accordion-down': 'accordion-down 0.2s ease-out',
                    'accordion-up': 'accordion-up 0.2s ease-out',
                },
                width: {
                    sidebar: '245px',
                },
            },
        },
    },
);

export const devotionPreset = {
    darkMode: ['class'],
    content: [],
    plugins: [animatePlugin, devotionPlugin],
} satisfies Config;
