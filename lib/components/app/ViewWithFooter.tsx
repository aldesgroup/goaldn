import {useNavigation} from '@react-navigation/native';
import {ScrollView, View} from 'react-native';
import {cn} from '../../utils/cn';
import {ArrowLeftIcon, ArrowRightIcon} from '../../utils/icons';
import {Button, buttonVariantsType, textColorForVariant} from '../ui/button-custom';
import {Txt} from '../ui/txt';

interface viewWithFooterProps {
    children: React.ReactNode;
    contentClassName?: string;
    footerClassName?: string;
    leftButtonLabel?: string;
    leftButtonVariant?: buttonVariantsType;
    leftButtonOnPress?: () => {};
    leftButtonDisabled?: boolean;
    leftButtonIcon?: null | ((props: {color: string}) => JSX.Element);
    rightButtonLabel?: string;
    rightButtonVariant?: buttonVariantsType;
    rightButtonOnPress: () => {};
    rightButtonDisabled?: boolean;
    rightButtonIcon?: null | ((props: {color: string}) => JSX.Element);
}

export function ViewWithFooter({
    contentClassName = 'py-8 px-6',
    leftButtonLabel = 'Previous',
    leftButtonVariant = 'secondary',
    leftButtonIcon = ArrowLeftIcon,
    rightButtonLabel = 'Next',
    rightButtonVariant = 'default',
    rightButtonIcon = ArrowRightIcon,
    ...props
}: viewWithFooterProps) {
    const navigation = useNavigation();
    const leftButtonOnPressAction = props.leftButtonOnPress || (() => navigation.goBack());
    const LeftButtonIcon = leftButtonIcon || (() => <></>);
    const RightButtonIcon = rightButtonIcon || (() => <></>);

    return (
        // Anchoring the footer
        <View className="flex-1">
            {/* Scrollable Content Area */}
            <ScrollView contentContainerClassName={cn('flex-grow', contentClassName)}>{props.children}</ScrollView>

            {/* Footer */}
            <View className={cn('h-24 flex-row justify-between rounded-t-2xl border border-gray-300 bg-white p-6', props.footerClassName)}>
                {/* Left button */}
                <Button variant={leftButtonVariant} onPress={leftButtonOnPressAction} disabled={props.leftButtonDisabled}>
                    <View className="flex-row items-center gap-3">
                        <LeftButtonIcon color={textColorForVariant(leftButtonVariant, props.leftButtonDisabled)} />
                        <Txt>{leftButtonLabel}</Txt>
                    </View>
                </Button>

                {/* Right button */}
                <Button variant={rightButtonVariant} onPress={props.rightButtonOnPress} disabled={props.rightButtonDisabled}>
                    <View className="flex-row items-center gap-3">
                        <Txt>{rightButtonLabel}</Txt>
                        <RightButtonIcon color={textColorForVariant(rightButtonVariant, props.rightButtonDisabled)} />
                    </View>
                </Button>
            </View>
        </View>
    );
}
