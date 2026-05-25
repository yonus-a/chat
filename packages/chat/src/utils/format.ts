/**
 * Format a number with comma separators (e.g. 1,000,000)
 */
export function formatCurrency(
  value: number | string,
  locale: string = "fa",
): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return String(value);
  const formatted = num.toLocaleString("en-US");
  return locale === "fa" ? replaceDigitsWithPersian(formatted) : formatted;
}

/**
 * Convert a number or string to Persian digits (no separators)
 */
export function toPersianNumbers(value: number | string): string {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
}

/**
 * Replace ASCII digits with Persian equivalents
 */
export function replaceDigitsWithPersian(value: string): string {
  return value.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
}

/**
 * Replace digits conditionally based on locale
 */
export function replaceDigitsByLocale(
  value: string,
  locale: string = "fa",
): string {
  if (locale === "fa" || locale === "ar") {
    return replaceDigitsWithPersian(value);
  }
  return value;
}

/**
 * Format bytes to human-readable string (KB, MB, GB)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0);
  return `${size} ${units[i]}`;
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(
  identifier: string,
  dir: "ltr" | "rtl" = "ltr",
): string {
  if (!identifier) return "";
  const digits = identifier.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("09")) {
    const formatted = `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    return dir === "rtl" ? `\u200F${formatted}` : formatted;
  }
  return identifier;
}

/**
 * Format seconds as MM:SS countdown
 */
export function formatCountdown(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * Format seconds as HH:MM:SS duration
 */
export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
