import {Platform} from 'react-native';
import {Txt} from '../base';
import {MenuProps, ScreensProps} from './Navigator-utils';

/**
 * Main navigator for the main menu.
 * @param props - Contains the menu configuration with entries and icons
 * @category Navigation
 */
export function MainNavigator(props: {menu: MenuProps}) {
    return <Txt>Not implemented on this {Platform.OS} platform!</Txt>;
}

/**
 * Navigator for the screens.
 * @param screens - Contains the screens configuration with entries and icons
 * @category Navigation
 */
export function ScreenNavigator(screens: ScreensProps) {
    return <Txt>Not implemented on this {Platform.OS} platform!</Txt>;
}
