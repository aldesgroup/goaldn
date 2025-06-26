import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {DefaultTheme, NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator, NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {useAtomValue} from 'jotai';
import React from 'react';
import {LogBox} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {smallScreenAtom, useInitAndSyncLanguage, useTranslator} from '../settings';
import {getColors} from '../styling';
import {MenuProps, ScreensProps} from './Navigator-utils';

// ------------------------------------------------------------------------------------------------
// --- Global navigation
// ------------------------------------------------------------------------------------------------

const BottomTab = createBottomTabNavigator();

// Hides warning when Strict Mode is active, in dev mode
LogBox.ignoreLogs(['findHostInstance_DEPRECATED']);

/**
 * Bottom tab navigator for the main menu. Each entry becomes a tab with an icon and translated label.
 *
 * @param props - Contains the menu configuration with entries and icons
 * @returns A bottom tab navigator component
 * @category Navigation
 */
function MenuNavigator(props: {menu: MenuProps}) {
    // --- shared state
    const smallScreen = useAtomValue(smallScreenAtom);

    // --- utils
    const translate = useTranslator();

    // --- effects

    // --- view
    return (
        <BottomTab.Navigator>
            {props.menu.entries.map(menuItem => {
                const {translation, missing} = translate(menuItem.name);

                return (
                    <BottomTab.Screen
                        key={menuItem.name}
                        name={menuItem.name}
                        component={menuItem.component}
                        options={{
                            tabBarIcon: ({focused, color, size}) => {
                                const IconComponent = menuItem.icon;
                                return <IconComponent color={color} size={size} />;
                            },
                            tabBarStyle: smallScreen && {height: 70},
                            headerShown: false,
                            title: translation,
                            tabBarLabelStyle: missing && {color: 'red'},
                            headerTitle: translation,
                            headerTintColor: (missing && 'red') || 'black',
                        }}
                    />
                );
            })}
        </BottomTab.Navigator>
    );
}

/**
 * Main navigation component that sets up the navigation container and theme.
 * Initializes language settings and provides safe area context.
 *
 * @param props - Contains the menu configuration for the bottom tab navigator
 * @returns The main navigation container with theme and safe area provider
 * @category Navigation
 */
export function MainNavigator(props: {menu: MenuProps}) {
    // shared state
    const colors = getColors();
    const theme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            background: colors.background,
            border: colors.border,
        },
    };

    // effects
    useInitAndSyncLanguage();

    // view
    return (
        <GestureHandlerRootView className="bg-background">
            <SafeAreaProvider>
                <NavigationContainer theme={theme}>
                    <MenuNavigator menu={props.menu} />
                </NavigationContainer>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

// ------------------------------------------------------------------------------------------------
// --- Navigation from 1 menu entry
// ------------------------------------------------------------------------------------------------

/**
 * Stack navigator for screens within a menu entry. Handles screen options, translations, and header configuration.
 *
 * @param screens - Configuration for the screens to be displayed
 * @returns A stack navigator component with configured screens
 * @category Navigation
 */
export function ScreenNavigator(screens: ScreensProps) {
    const Stack = createNativeStackNavigator();
    const translate = useTranslator();
    const smallScreen = useAtomValue(smallScreenAtom);
    return (
        <Stack.Navigator>
            {screens.items.map((screen, index) => {
                const getHeaderTitle = (props: {navigation: any; route: any}): string => {
                    const options = screen.options && screen.options(props);
                    return options?.headerTitle?.toString() || options?.title?.toString() || screen.name;
                };

                const getOptions = (props: {navigation: any; route: any}): NativeStackNavigationOptions => {
                    const baseOptions = (screen.options && screen.options(props)) || {};
                    const headerTitle = getHeaderTitle(props);
                    const {translation, missing} = translate(headerTitle);

                    return {
                        ...baseOptions,
                        headerTitle: translation,
                        headerTintColor: (missing && 'red') || 'black',
                        headerShadowVisible: true, // shadow on Android, border on iOS
                    };
                };

                return (
                    <Stack.Screen
                        name={(index === 0 ? '_' : '') + screen.name}
                        //@ts-ignore
                        component={screen.component}
                        options={getOptions}
                        key={screen.name}
                    />
                );
            })}
        </Stack.Navigator>
    );
}
