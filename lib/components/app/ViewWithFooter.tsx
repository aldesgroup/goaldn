import {useNavigation} from '@react-navigation/native';
import {ScrollView, View} from 'react-native';
import {cn} from '../../utils/cn';
import {Button, buttonVariantsType, textColorForVariant} from '../ui/custom/button-pimped';
import {Txt} from '../ui/custom/txt';
import {LucideIcon, MoveLeft, MoveRight} from 'lucide-react-native';
import {useAtomValue} from 'jotai';
import {smallScreenAtom} from '../../utils/settings';

export type viewWithFooterProps = {
    children: React.ReactNode;
    contentClassName?: string;
    footerClassName?: string;
    leftButtonLabel?: string;
    leftButtonVariant?: buttonVariantsType;
    leftButtonOnPress: null | (() => void);
    leftButtonDisabled?: boolean;
    leftButtonIcon?: null | LucideIcon;
    rightButtonLabel?: string;
    rightButtonVariant?: buttonVariantsType;
    rightButtonOnPress: () => void;
    rightButtonDisabled?: boolean;
    rightButtonIcon?: null | LucideIcon;
};

export function ViewWithFooter({
    contentClassName = 'p-8',
    leftButtonLabel = 'Previous',
    leftButtonVariant = 'secondary',
    leftButtonIcon = MoveLeft,
    rightButtonLabel = 'Next',
    rightButtonVariant = 'default',
    rightButtonIcon = MoveRight,
    ...props
}: viewWithFooterProps) {
    // --- shared state
    const smallScreen = useAtomValue(smallScreenAtom);

    // --- local state
    const LeftButtonIcon = leftButtonIcon || (() => <></>);
    const RightButtonIcon = rightButtonIcon || (() => <></>);

    // --- view
    return (
        // Anchoring the footer
        <View className="flex-1">
            {/* Scrollable Content Area */}
            <ScrollView contentContainerClassName={cn('flex-grow flex-col gap-6', smallScreen && 'gap-9', contentClassName)}>
                {props.children}
            </ScrollView>

            {/* Footer */}
            <View
                className={cn(
                    'h-24 flex-row justify-between rounded-t-2xl border border-gray-300 bg-white p-6',
                    smallScreen && 'h-32',
                    !props.leftButtonOnPress && 'justify-end',
                    props.footerClassName,
                )}>
                {/* Left button */}
                {props.leftButtonOnPress && (
                    <Button variant={leftButtonVariant} onPress={props.leftButtonOnPress} disabled={props.leftButtonDisabled}>
                        <View className="flex-row items-center gap-3">
                            {!smallScreen && <LeftButtonIcon color={textColorForVariant(leftButtonVariant, props.leftButtonDisabled)} size={18} />}
                            <Txt>{leftButtonLabel}</Txt>
                        </View>
                    </Button>
                )}

                {/* Right button */}
                <Button variant={rightButtonVariant} onPress={props.rightButtonOnPress} disabled={props.rightButtonDisabled}>
                    <View className="flex-row items-center gap-3">
                        <Txt>{rightButtonLabel}</Txt>
                        {!smallScreen && <RightButtonIcon color={textColorForVariant(rightButtonVariant, props.rightButtonDisabled)} size={18} />}
                    </View>
                </Button>
            </View>
        </View>
    );
}
