import {Platform} from 'react-native';
import {ScreensConfig} from 'tailwindcss/types/config';
import {Txt} from '../../ui/custom/txt';
import {MenuProps, ScreensProps} from './Navigator-utils';

export function MainNavigator(props: {menu: MenuProps}) {
    return <Txt>Not implemented on this {Platform.OS} platform!</Txt>;
}

export function ScreenNavigator(screens: ScreensProps) {
    return <Txt>Not implemented on this {Platform.OS} platform!</Txt>;
}
