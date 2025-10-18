import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges multiple class names into a single string, with proper Tailwind CSS conflict resolution.
 *
 * This utility combines `clsx` for conditional class handling and `twMerge` for resolving
 * Tailwind CSS class conflicts. When multiple Tailwind utility classes conflict (e.g.,
 * 'p-4' and 'p-2'), the last one wins.
 *
 * @param inputs - Any number of class values (strings, objects, arrays, etc.)
 * @returns A merged and deduplicated class string
 *
 * @example
 * cn('p-4', 'text-center') // => 'p-4 text-center'
 * cn('p-4', 'p-2') // => 'p-2' (conflict resolved)
 * cn('base', { 'active': true, 'disabled': false }) // => 'base active'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
