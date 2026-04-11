import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format price in SDG (Sudanese Pound)
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ar-SD', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

// Format date in Arabic locale
export function formatDate(date: string | Date, locale: 'ar' | 'en' = 'ar'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SD' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

// Format relative time (e.g., "منذ 5 دقائق")
export function formatRelativeTime(date: string | Date, locale: 'ar' | 'en' = 'ar'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (locale === 'ar') {
    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return formatDate(d, locale);
  } else {
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return formatDate(d, locale);
  }
}

// Format phone number for display
export function formatPhone(phone: string): string {
  // Keep numbers LTR
  return phone;
}

// Validate Sudanese phone number
export function isValidSudanesePhone(phone: string): boolean {
  // Sudan phone format: +249 XX XXX XXXX
  const cleaned = phone.replace(/\s+/g, '');
  return /^\+249\d{9}$/.test(cleaned);
}

// Get status color class
export function getStatusColorClass(status: string): string {
  const statusColors: Record<string, string> = {
    pending: 'status-pending',
    offered: 'status-offered',
    accepted: 'status-accepted',
    in_transit: 'status-in-transit',
    delivered: 'status-delivered',
    completed: 'status-completed',
    cancelled: 'status-cancelled',
    available: 'bg-green-100 text-green-800',
    in_use: 'bg-blue-100 text-blue-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    inactive: 'bg-gray-100 text-gray-800',
    verified: 'bg-green-100 text-green-800',
    not_verified: 'bg-yellow-100 text-yellow-800',
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

// Generate a random ID (for temporary use)
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
