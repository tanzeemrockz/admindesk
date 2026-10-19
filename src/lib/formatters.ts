/**
 * Formats a number to Indian Rupee (INR) representation, e.g. ₹45,000
 */
export function formatINR(value: number | string | undefined | null): string {
  const n = Number(value) || 0;
  return '₹' + n.toLocaleString('en-IN');
}

/**
 * Sanitizes phone number to Indian WhatsApp format (+91 or digits only)
 */
export function formatWhatsAppNumber(raw: string | undefined | null): string {
  if (!raw) return '';
  const digits = String(raw).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return '91' + digits;
  return digits;
}

/**
 * Validates and safely escapes URLs
 */
export function safeUrl(raw: string | undefined | null): string {
  if (!raw) return '';
  const trimmed = String(raw).trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(trimmed)) return 'https://' + trimmed;
  return '';
}

/**
 * Formats ISO date string to human-readable date
 */
export function formatDate(isoString: string | undefined | null): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return '';
  }
}
