import {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {X} from 'lucide-react-native';
import {Avatar, AvatarProps} from '../layout';
import {LanguageSwitcher} from '../settings';

/**
 * Type definition for navigation option functions.
 * These functions take a navigation object and return navigation options.
 * @category Navigation
 */
export type OptionFunction = ({navigation}: {navigation: any}) => NativeStackNavigationOptions;

/**
 * Combines multiple navigation option functions into a single function.
 * The resulting function merges all options from the input functions.
 *
 * @param {...OptionFunction} optionFunctions - Array of option functions to combine
 * @returns {OptionFunction} A new function that combines all input options
 * @category Navigation
 */
export const CombineOptions = (...optionFunctions: OptionFunction[]): OptionFunction => {
    return ({navigation}) => {
        return optionFunctions.reduce((combinedOptions, optionFunction) => {
            return {...combinedOptions, ...optionFunction({navigation})};
        }, {});
    };
};

/**
 * Creates navigation options to show a close (X) icon in the header.
 * The icon can navigate to a specific screen, back to root, or just go back.
 *
 * @param {string} [quitToScreen] - Optional screen name to navigate to when closing
 * @param {boolean} [quitBackToRoot] - Whether to navigate back to root when closing
 * @returns {OptionFunction} Navigation options with close icon configuration
 * @category Navigation
 */
export const CloseIconOption =
    (quitToScreen?: string, quitBackToRoot?: boolean) =>
    ({navigation}: {navigation: any}) => ({
        // to differ from "normal" navigation (slide-in effect, with back arrow)
        headerRight: () => (
            <X onPress={() => (quitToScreen ? navigation.navigate(quitToScreen) : quitBackToRoot ? navigation.popToTop() : navigation.goBack())} />
        ),
        headerBackVisible: false,
    });

/**
 * Navigation options to display the language switcher in the header.
 *
 * @param {{navigation: any}} param0 - Navigation object
 * @returns {NativeStackNavigationOptions} Navigation options with language switcher
 * @category Navigation
 */
export const LanguageSwitcherOption_ = ({navigation}: {navigation: any}) => ({
    headerRight: LanguageSwitcher,
});

/**
 * Navigation options to hide the back button in the header.
 * @category Navigation
 */
export const RemoveBackButtonOption: OptionFunction = ({navigation}: {navigation: any}) => ({
    headerBackVisible: false,
});

/**
 * Navigation options to hide the entire header.
 * @category Navigation
 */
export const RemoveHeaderOption: OptionFunction = ({navigation}: {navigation: any}) => ({
    headerShown: false,
});

/**
 * Creates navigation options for a screen with a title and optional close icon.
 *
 * @param {string} title - The title to display in the header
 * @param {Object} [params] - Optional parameters for additional configuration
 * @param {boolean} [params.withCloseIcon] - Whether to show a close icon
 * @param {string} [params.quitToScreen] - Screen to navigate to when closing
 * @param {boolean} [params.quitBackToRoot] - Whether to navigate to root when closing
 * @param {boolean} [params.removeBackButton] - Whether to hide the back button
 * @returns {OptionFunction} Navigation options with title and optional close icon
 * @category Navigation
 */
export const TitleOption = (
    title: string,
    params?: {withCloseIcon?: boolean; quitToScreen?: string; quitBackToRoot?: boolean; removeBackButton?: boolean},
): OptionFunction => {
    const baseTitleOption = ({navigation}: {navigation: any}) => ({title: title});
    return params?.withCloseIcon
        ? CombineOptions(baseTitleOption, CloseIconOption(params.quitToScreen, params.quitBackToRoot))
        : params?.removeBackButton
          ? CombineOptions(baseTitleOption, RemoveBackButtonOption)
          : baseTitleOption;
};

/**
 * Navigation options for screens that should fade in from the bottom.
 * These screens will have no header and use a fade animation.
 * @category Navigation
 */
export const FadeInOption = ({navigation}: {navigation: any}) => ({animation: 'fade_from_bottom', headerShown: false});

/**
 * Creates navigation options to display an Avatar component in the header.
 *
 * @param {AvatarProps} props - Props to pass to the Avatar component
 * @returns {OptionFunction} Navigation options with Avatar configuration
 * @category Navigation
 */
export const AvatarOption =
    (props: AvatarProps) =>
    ({navigation}: {navigation: any}) => ({
        // to differ from "normal" navigation (slide-in effect, with back arrow)
        headerRight: () => <Avatar {...props} />,
    });
