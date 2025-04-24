import {ReactNode} from 'react';
import {View} from 'react-native';
import {Txt} from '../ui/custom/txt';
import {X} from 'lucide-react-native';
import {getColors} from '../../styles/theme';

export function BottomView({children, headerTitle, onClose}: {children: ReactNode; headerTitle: string; onClose: () => void}) {
    // --- shared state
    const colors = getColors();

    // --- view
    return (
        <View className="bg-foreground-light flex-1">
            <View className="h-1/3"></View>
            <View className="h-2/3 rounded-t-3xl bg-white p-6 pt-10">
                {/* "Header" */}
                <View className="flex-row justify-between pb-10">
                    <Txt className="text-primary text-2xl font-bold">{headerTitle}</Txt>
                    <X color={colors.foreground} onPress={onClose} />
                </View>
                {children}
            </View>
        </View>
    );
}
