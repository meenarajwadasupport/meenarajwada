import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

export function calcDiscount(price: number, mrp: number) {
  if (!mrp || mrp <= price) return 0
  return Math.round(((mrp - price) / mrp) * 100)
}

export function calcShipping(subtotal: number): number {
  if (subtotal >= 5000) return 0
  if (subtotal >= 2000) return 99
  return 199
}

export function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}
