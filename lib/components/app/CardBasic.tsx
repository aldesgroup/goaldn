import {View} from 'react-native';
import {cn} from '../../utils/cn';

export function Card({children, className}: {children: React.ReactNode; className?: string}) {
    return <View className={cn('border-border rounded-3xl border bg-white p-6', className)}>{children}</View>;
}
