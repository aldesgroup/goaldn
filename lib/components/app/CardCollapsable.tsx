import {useAtomValue} from 'jotai';
import {ChevronDown, ChevronUp} from 'lucide-react-native';
import {useState} from 'react';
import {Pressable, View} from 'react-native';
import {getColors} from '../../styles/theme';
import {cn} from '../../utils/cn';
import {smallScreenAtom} from '../../utils/settings';
import {Txt} from '../ui/custom/txt';
import {Card} from './CardBasic';

export function CollapsableCard({title, children, alwaysVisible}: {title: string; children: React.ReactNode; alwaysVisible?: React.ReactNode}) {
    // shared state
    const colors = getColors();
    const smallScreen = useAtomValue(smallScreenAtom);

    // local state
    const [cardOpen, setCardOpen] = useState(false);

    // view
    return (
        <Card>
            <Pressable onPress={() => setCardOpen(!cardOpen)}>
                <View className="flex-row items-center justify-between">
                    <Txt className={cn('text-primary text-xl font-bold', smallScreen && 'flex-1')}>{title}</Txt>
                    {!cardOpen ? <ChevronDown color={colors.primary} /> : <ChevronUp color={colors.primary} />}
                </View>
            </Pressable>
            {cardOpen && children}
            {alwaysVisible && alwaysVisible}
        </Card>
    );
}
