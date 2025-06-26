import {RouteConfigComponent} from '@react-navigation/native';
import {LucideIcon} from 'lucide-react-native';
import {OptionFunction} from './Navigator-options';

/**
 * Represents a single menu entry in the navigation menu.
 * @property {string} name - The name/label of the menu entry
 * @property {React.ComponentType<any>} component - The React component to render for this menu item
 * @property {LucideIcon} icon - The icon to display for this menu item
 * @category Navigation
 */
interface menuEntry {
    name: string;
    component: React.ComponentType<any>;
    icon: LucideIcon;
}

/**
 * Configuration options for the Windows menu.
 * @property {() => React.ReactNode} [logo] - Optional function that returns a logo component
 * @category Navigation
 */
interface menuWindowsConfig {
    logo?: () => React.ReactNode;
}

/**
 * Props for the Menu component.
 * @property {menuEntry[]} entries - Array of menu entries to display
 * @property {menuWindowsConfig} [windows] - Optional Windows-specific menu configuration
 * @category Navigation
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
 * @category Navigation
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
 * @category Navigation
 */
export interface ScreensProps {
    navigation: any;
    items: screenItemProps[];
}
