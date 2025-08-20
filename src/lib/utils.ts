// Debug flag: set to true to enable debug logs
export const DEBUG = true;

// Debug log utility
export function debugLog(...args: unknown[]) {
  if (DEBUG) {
    console.log('[DEBUG]', ...args);
  }
}
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
