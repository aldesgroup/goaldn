import {View} from 'react-native';
import {cn} from '../../utils/cn';

/**
 * A basic card component with a white background and rounded borders.
 *
 * @param {Object} props - The component props
 * @param {React.ReactNode} props.children - The content to display in the card
 * @param {string} [props.className] - Additional CSS classes for the card
 * @returns {JSX.Element} A card component with consistent styling
 */
export function Card({children, className}: {children: React.ReactNode; className?: string}) {
    return <View className={cn('border-border rounded-3xl border bg-white p-6', className)}>{children}</View>;
}
