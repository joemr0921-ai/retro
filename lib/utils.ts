import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind CSS classes intelligently.
 * Usage: cn('px-4 py-2', isActive && 'bg-coral-400', className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
