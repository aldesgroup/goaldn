import {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {X} from 'lucide-react-native';
import {LanguageSwitcher} from '../../misc';
import {Avatar, AvatarProps} from '../Avatar';

// Signature for option functions
export type OptionFunction = ({navigation}: {navigation: any}) => NativeStackNavigationOptions;

// Function to combine multiple OptionFunction functions
export const CombineOptions = (...optionFunctions: OptionFunction[]): OptionFunction => {
    return ({navigation}) => {
        return optionFunctions.reduce((combinedOptions, optionFunction) => {
            return {...combinedOptions, ...optionFunction({navigation})};
        }, {});
    };
};

// Shows in the header a X icon on the right to close the current screen, hiding the back arrow
export const CloseIconOption =
    (quitToScreen?: string, quitBackToRoot?: boolean) =>
    ({navigation}: {navigation: any}) => ({
        // to differ from "normal" navigation (slide-in effect, with back arrow)
        headerRight: () => (
            <X onPress={() => (quitToScreen ? navigation.navigate(quitToScreen) : quitBackToRoot ? navigation.popToTop() : navigation.goBack())} />
        ),
        headerBackVisible: false,
    });

// Display the language switcher component in the header on the right
export const LanguageSwitcherOption_ = ({navigation}: {navigation: any}) => ({
    headerRight: LanguageSwitcher,
});

export const RemoveBackButtonOption: OptionFunction = ({navigation}: {navigation: any}) => ({
    headerBackVisible: false,
});

export const RemoveHeaderOption: OptionFunction = ({navigation}: {navigation: any}) => ({
    headerShown: false,
});

// Allows to change the title, an optionally to display the X close icon
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

// Option used for the screens that should fade in from the bottom
export const FadeInOption = ({navigation}: {navigation: any}) => ({animation: 'fade_from_bottom', headerShown: false});

// Options used to add an Avatar in the header on the right
export const AvatarOption =
    (props: AvatarProps) =>
    ({navigation}: {navigation: any}) => ({
        // to differ from "normal" navigation (slide-in effect, with back arrow)
        headerRight: () => <Avatar {...props} />,
    });
