import {type ClassValue, clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';

/**
 * Utility function that combines multiple class names and merges Tailwind CSS classes efficiently.
 * Uses clsx for conditional class names and tailwind-merge to handle Tailwind class conflicts.
 * @param {...ClassValue[]} inputs - Class names to be combined and merged.
 * @returns {string} A string of merged class names.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
