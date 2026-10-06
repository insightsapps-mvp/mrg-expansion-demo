import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const WHATSAPP_URL =
  'https://wa.me/5491139375146?text=Vi%20el%20demo%20de%20MRG%20Expansi%C3%B3n%2C%20quiero%20que%20avancemos!';

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
