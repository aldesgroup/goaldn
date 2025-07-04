import {View} from 'react-native';
import {cn} from '../base';

/**
 * A basic card component with a white background and rounded borders.
 *
 * @param {Object} props - The component props
 * @param {React.ReactNode} props.children - The content to display in the card
 * @param {string} [props.className] - Additional CSS classes for the card
 * @returns {JSX.Element} A card component with consistent styling
 * @category Layout
 */
export function Card({children, className}: {children: React.ReactNode; className?: string}) {
    return <View className={cn('border-border bg-background rounded-3xl border p-6', className)}>{children}</View>;
}
