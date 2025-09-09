import {useAtom, useAtomValue, WritableAtom} from 'jotai';
import {ChevronDown, ChevronUp} from 'lucide-react-native';
import React, {useState} from 'react';
import {Pressable, View} from 'react-native';
import {Button, cn, Txt} from '../base';
import {smallScreenAtom} from '../settings';
import {getColors} from '../styling';
import {Card} from './CardBasic';

/**
 * A collapsible card component that can be expanded and collapsed with a header and optional content.
 * The card supports both controlled (via atom) and uncontrolled state management.
 * @property {string} title - The title text for the card
 * @property {React.ReactNode} children - The content to display when the card is expanded
 * @property {React.ReactNode} [alwaysVisible] - Content that is always visible regardless of card state
 * @property {string} [className] - Additional CSS classes for the card
 * @property {boolean} [allowCollapse=true] - Whether the card can be collapsed
 * @property {boolean} [withCloseButton] - Whether to show a close button when expanded
 * @property {WritableAtom<boolean>} [openAtom] - Optional atom to control the card's open state
 * @category Layout
 */
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
