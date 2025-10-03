import {X} from 'lucide-react-native';
import {ReactNode} from 'react';
import {View} from 'react-native';
import {cn, Txt} from '../base';
import {getColors} from '../styling';

/**
 * A bottom sheet component that slides up from the bottom of the screen with a customizable height.
 * It includes a header with a title and close button, and can display any content in its body.
 * @property {ReactNode} children - The content to display in the view
 * @property {string} headerTitle - The title text for the header
 * @property {() => void} onClose - Function to call when the close button is pressed
 * @property {'h-2/3' | 'h-1/2' | 'h-1/3' | 'h-3/4' | 'h-5/6'} [h='h-2/3'] - The height of the view
 * @property {boolean} [closeDisabled] - Whether the close button is disabled
 * @category Layout
 */
export function BottomView({
    children,
    headerTitle,
    onClose,
    h = 'h-2/3',
    closeDisabled,
}: {
    children: ReactNode;
    headerTitle: string;
    onClose: () => void;
    h?: 'h-2/3' | 'h-1/2' | 'h-1/3' | 'h-3/4' | 'h-5/6';
    closeDisabled?: boolean;
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
        <View className="bg-foreground-light pb-safe flex-1">
            <View className={cn(voidHeight)}>{/* empty on purpose */}</View>
            <View className={cn('rounded-t-3xl bg-white p-6 pt-10', h)}>
                {/* "Header" */}
                <View className="flex-row justify-between pb-10">
                    <Txt className={cn('text-primary w-11/12 text-2xl font-bold')}>{headerTitle}</Txt>
                    <X color={closeDisabled ? colors.muted : colors.foreground} onPress={onClose} disabled={closeDisabled} />
                </View>
                {/* View's content */}
                {children}
            </View>
        </View>
    );
}
