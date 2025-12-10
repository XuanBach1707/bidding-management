import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Hàm này giúp gộp class an toàn
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}