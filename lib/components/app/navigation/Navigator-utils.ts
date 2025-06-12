import {RouteConfigComponent} from '@react-navigation/native';
import {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {OptionFunction} from './Navigator-options';
import {LucideIcon} from 'lucide-react-native';

/**
 * Represents a single menu entry in the navigation menu.
 * @property {string} name - The name/label of the menu entry
 * @property {React.ComponentType<any>} component - The React component to render for this menu item
 * @property {LucideIcon} icon - The icon to display for this menu item
 */
interface menuEntry {
    name: string;
    component: React.ComponentType<any>;
    icon: LucideIcon;
}

/**
 * Configuration options for the Windows menu.
 * @property {() => React.ReactNode} [logo] - Optional function that returns a logo component
 */
interface menuWindowsConfig {
    logo?: () => React.ReactNode;
}

/**
 * Props for the Menu component.
 * @property {menuEntry[]} entries - Array of menu entries to display
 * @property {menuWindowsConfig} [windows] - Optional Windows-specific menu configuration
 */
export interface MenuProps {
    entries: menuEntry[];
    windows?: menuWindowsConfig;
}

/**
 * Props for a single screen item in the navigation stack.
 * @property {string} name - The name/route of the screen
 * @property {RouteConfigComponent<any, any>} component - The React component to render for this screen
 * @property {OptionFunction} options - Function that returns navigation options for this screen
 */
interface screenItemProps {
    name: string;
    component: RouteConfigComponent<any, any>;
    options: OptionFunction;
}

/**
 * Props for the Screens component.
 * @property {any} navigation - The navigation object from React Navigation
 * @property {screenItemProps[]} items - Array of screen items to render in the navigation stack
 */
export interface ScreensProps {
    navigation: any;
    items: screenItemProps[];
}
