import {atom, useAtom, useAtomValue, WritableAtom} from 'jotai';
import {ChevronDown, ChevronUp} from 'lucide-react-native';
import {useEffect, useRef, useState} from 'react';
import {Pressable, View} from 'react-native';
import {getColors} from '../../styles/theme';
import {cn} from '../../utils/cn';
import {smallScreenAtom} from '../../utils/settings';
import {Button} from '../ui/custom/button-pimped';
import {Txt} from '../ui/custom/txt';
import {Card} from './CardBasic';

export function CollapsableCard({
    title,
    children,
    alwaysVisible,
    className,
    allowCollapse = true,
    withCloseButton,
    openAtom,
}: {
    title: string;
    children: React.ReactNode;
    alwaysVisible?: React.ReactNode;
    className?: string;
    allowCollapse?: boolean;
    withCloseButton?: boolean;
    openAtom?: WritableAtom<boolean | Promise<boolean>, any, any>;
}) {
    // --- shared state
    const colors = getColors();
    const smallScreen = useAtomValue(smallScreenAtom);
    const [cardOpenFromAtom, setCardOpenAtom] = openAtom ? useAtom(openAtom) : [undefined, undefined];

    // --- local state
    const [internalCardOpen, setInternalCardOpen] = useState(false);
    const cardOpen = cardOpenFromAtom || internalCardOpen;
    const setCardOpen = setCardOpenAtom || setInternalCardOpen;

    // --- view
    return (
        <Card className={cn(className)}>
            <Pressable onPress={() => setCardOpen(!cardOpen)}>
                <View className="flex-row items-center justify-between">
                    <Txt className={cn('text-primary text-xl font-bold', smallScreen && 'flex-1')}>{title}</Txt>
                    {allowCollapse && <>{!cardOpen ? <ChevronDown color={colors.primary} /> : <ChevronUp color={colors.primary} />}</>}
                </View>
            </Pressable>
            {cardOpen && children}
            {alwaysVisible && alwaysVisible}
            {withCloseButton && cardOpen && (
                <Button disabled={!allowCollapse} onPress={() => setCardOpen(false)}>
                    <Txt>Close</Txt>
                </Button>
            )}
        </Card>
    );
}
