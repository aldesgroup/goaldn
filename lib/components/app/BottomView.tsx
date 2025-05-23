import {X} from 'lucide-react-native';
import {ReactNode} from 'react';
import {View} from 'react-native';
import {getColors} from '../../styles/theme';
import {cn} from '../../utils/cn';
import {Txt} from '../ui/custom/txt';

export function BottomView({
    children,
    headerTitle,
    onClose,
    h = 'h-2/3',
}: {
    children: ReactNode;
    headerTitle: string;
    onClose: () => void;
    h?: 'h-2/3' | 'h-1/2' | 'h-1/3' | 'h-3/4' | 'h-5/6';
}) {
    // --- shared state
    const colors = getColors();
    let voidHeight = 'h-1/3';
    switch (h) {
        case 'h-1/2':
            voidHeight = 'h-1/2';
            break;
        case 'h-1/3':
            voidHeight = 'h-2/3';
            break;
        case 'h-3/4':
            voidHeight = 'h-1/4';
            break;
        case 'h-5/6':
            voidHeight = 'h-1/6';
            break;
    }

    // --- view
    return (
        <View className="bg-foreground-light flex-1">
            <View className={cn(voidHeight)}>{/* empty on purpose */}</View>
            <View className={cn('rounded-t-3xl bg-white p-6 pt-10', h)}>
                {/* "Header" */}
                <View className="flex-row justify-between pb-10">
                    <Txt className={cn('text-primary w-11/12 text-2xl font-bold')}>{headerTitle}</Txt>
                    <X color={colors.foreground} onPress={onClose} />
                </View>
                {/* View's content */}
                {children}
            </View>
        </View>
    );
}
