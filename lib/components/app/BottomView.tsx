import {ReactNode} from 'react';
import {View} from 'react-native';
import {Txt} from '../ui/custom/txt';
import {X} from 'lucide-react-native';
import {getColors} from '../../styles/theme';
import {cn} from '../../utils/cn';

export function BottomView({
    children,
    headerTitle,
    onClose,
    h = '2/3',
}: {
    children: ReactNode;
    headerTitle: string;
    onClose: () => void;
    h?: '2/3' | '1/2' | '1/3';
}) {
    // --- shared state
    const colors = getColors();
    const contentHeight = 'h-' + h;
    const voidHeight = h === '2/3' ? 'h-1/3' : h === '1/2' ? 'h-1/2' : 'h-2/3';

    // --- view
    return (
        <View className="bg-foreground-light flex-1">
            <View className={cn(voidHeight)}>{/* empty on purpose */}</View>
            <View className={cn('rounded-t-3xl bg-white p-6 pt-10', contentHeight)}>
                {/* "Header" */}
                <View className="flex-row justify-between pb-10">
                    <Txt className="text-primary text-2xl font-bold">{headerTitle}</Txt>
                    <X color={colors.foreground} onPress={onClose} />
                </View>
                {/* View's content */}
                {children}
            </View>
        </View>
    );
}
