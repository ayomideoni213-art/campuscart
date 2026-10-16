/**
 * Nigerian Localization and Formatting Utilities
 * Handles Nigerian Naira currency formatting, Nigerian phone number normalization (+234),
 * WhatsApp click-to-chat links, and Instagram profile URLs.
 */

/**
 * Formats a monetary number into Nigerian Naira (₦).
 * e.g. formatNaira(1500) => "₦1,500"
 * e.g. formatNaira(1500.5) => "₦1,500.50"
 */
export function formatNaira(amount: number): string {
  if (isNaN(amount)) return '₦0';
  const hasDecimals = amount % 1 !== 0;
  return `₦${amount.toLocaleString('en-NG', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Normalizes a Nigerian phone number to international E.164 format (+234...)
 * Handles inputs like:
 * - "08012345678" -> "+2348012345678"
 * - "2348012345678" -> "+2348012345678"
 * - "+234 801 234 5678" -> "+2348012345678"
 * - "8012345678" -> "+2348012345678"
 */
export function normalizeNigerianPhone(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/[^0-9+]/g, '');

  if (cleaned.startsWith('+234')) {
    return cleaned;
  }
  if (cleaned.startsWith('234')) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return `+234${cleaned.slice(1)}`;
  }
  if (cleaned.length === 10) {
    return `+234${cleaned}`;
  }
  return phone;
}

/**
 * Validates whether a phone number is a valid Nigerian mobile number.
 */
export function isValidNigerianPhone(phone: string): boolean {
  if (!phone) return false;
  const digitsOnly = phone.replace(/[^0-9]/g, '');
  // Valid Nigerian numbers: 080..., 081..., 070..., 090..., 091...
  // 11 digits starting with 0, or 13 digits starting with 234
  if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    return /^0(70|80|81|90|91|71|82)\d{8}$/.test(digitsOnly);
  }
  if (digitsOnly.length === 13 && digitsOnly.startsWith('234')) {
    return /^234(70|80|81|90|91|71|82)\d{8}$/.test(digitsOnly);
  }
  return digitsOnly.length >= 10 && digitsOnly.length <= 14;
}

/**
 * Generates or normalizes a WhatsApp click-to-chat URL (https://wa.me/234...)
 * Can accept a raw phone number or an existing wa.me link.
 */
export function normalizeWhatsAppUrl(input: string, message?: string): string {
  if (!input) return '';
  const trimmed = input.trim();

  // If already a valid wa.me or api.whatsapp.com link
  if (trimmed.startsWith('https://wa.me/') || trimmed.startsWith('http://wa.me/')) {
    return trimmed;
  }
  if (trimmed.startsWith('wa.me/')) {
    return `https://${trimmed}`;
  }
  if (trimmed.includes('whatsapp.com')) {
    return trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
  }

  // Treat as phone number
  const normalizedPhone = normalizeNigerianPhone(trimmed);
  const digitsOnly = normalizedPhone.replace(/[^0-9]/g, '');

  if (!digitsOnly) return '';

  const encodedMsg = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${digitsOnly}${encodedMsg}`;
}

/**
 * Validates WhatsApp Link
 */
export function isValidWhatsAppUrl(url: string): boolean {
  if (!url) return false;
  return /^(https?:\/\/)?(wa\.me\/\d+|api\.whatsapp\.com\/send\?phone=\d+)/.test(url.trim()) ||
    isValidNigerianPhone(url);
}

/**
 * Normalizes an Instagram username or URL into a full HTTPS URL.
 * e.g. "@campus_style" -> "https://instagram.com/campus_style"
 * e.g. "campus_style" -> "https://instagram.com/campus_style"
 * e.g. "https://instagram.com/campus_style" -> "https://instagram.com/campus_style"
 */
export function normalizeInstagramUrl(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();

  if (trimmed.startsWith('https://instagram.com/') || trimmed.startsWith('https://www.instagram.com/')) {
    return trimmed;
  }
  if (trimmed.startsWith('http://instagram.com/') || trimmed.startsWith('http://www.instagram.com/')) {
    return trimmed.replace('http://', 'https://');
  }
  if (trimmed.startsWith('instagram.com/')) {
    return `https://${trimmed}`;
  }

  // Handle @handle or raw handle
  const cleanHandle = trimmed.replace(/^@/, '').replace(/[^a-zA-Z0-9._]/g, '');
  return cleanHandle ? `https://instagram.com/${cleanHandle}` : '';
}

/**
 * Extracts username from an Instagram link or handle for display.
 */
export function getInstagramHandle(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  const match = trimmed.match(/(?:instagram\.com\/)?(?:@)?([a-zA-Z0-9._]+)/);
  return match && match[1] ? `@${match[1]}` : input;
}

/**
 * Validates Instagram Link or Handle
 */
export function isValidInstagramUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  return /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$/.test(trimmed) ||
    /^@?[a-zA-Z0-9._]{1,30}$/.test(trimmed);
}
