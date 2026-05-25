/**
 * Formats a number with commas and localized digits based on the current locale.
 * Maps 'fa' to 'fa-IR' to ensure Persian digits (۰۱۲۳) are used.
 * @param value - The number or string to format
 * @param locale - The current i18n locale (e.g., 'fa' or 'en')
 */
export const formatCurrency = (value: number | string, locale?: string) => {
  // Convert string to number if needed, removing commas to prevent NaN
  const num =
    typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;

  if (isNaN(num)) return value;

  // Map 'fa' to 'fa-IR' so Intl uses Persian digits instead of Western digits
  const targetLocale = locale === "fa" ? "fa-IR" : locale;

  return new Intl.NumberFormat(targetLocale).format(num);
};

/**
 * Converts digits to Persian digits without adding thousands separators.
 * Improved to handle strings with existing commas safely.
 * @param value - The number or string to convert
 */
export const toPersianNumbers = (value: number | string) => {
  // Use parseFloat and remove commas to avoid "ناعدد" (NaN)
  const num =
    typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;

  if (isNaN(num)) return value;

  return new Intl.NumberFormat("fa-IR", { useGrouping: false }).format(num);
};

/**
 * Replaces all English digits (0-9) in a string with Persian digits (۰-۹).
 * Preserves leading zeros and non-numeric characters.
 * @param value - The string or number containing digits to convert
 */
export const replaceDigitsWithPersian = (value: string | number): string => {
  if (value === null || value === undefined) return "";

  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  return String(value).replace(/\d/g, (digit) => {
    return persianDigits[parseInt(digit)];
  });
};

/**
 * جایگزینی تمام اعداد انگلیسی داخل یک رشته با اعداد فارسی بر اساس زبان
 * @param value - رشته یا عددی که باید تبدیل شود
 * @param locale - زبان فعلی (fa یا en)
 */
export const replaceDigitsByLocale = (
  value: string | number,
  locale: string = "fa",
): string => {
  if (value === null || value === undefined) return "";

  const str = String(value);

  // اگر زبان فارسی نبود، همان رشته اصلی را برگردان
  if (locale !== "fa") return str;

  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  // جایگزینی تمام رقم‌ها با استفاده از Regular Expression
  return str.replace(/\d/g, (digit) => {
    return persianDigits[parseInt(digit)];
  });
};

/**
 * Formats a phone number into a readable standard.
 * Example: 9134168227 -> 913 416 8227
 * @param bytes - The raw string or number
 */
export const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 KB";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

/**
 * Formats a phone number into a readable standard.
 * Example: 9134168227 -> 913 416 8227
 * @param phoneNumber - The raw string or number
 */
export const formatPhoneNumber = (
  identifier: string,
  dir: string = "ltr",
): string => {
  if (!identifier) return "";

  const clean = identifier.replace(/\D/g, "");

  if (clean.length === 11 && clean.startsWith("09")) {
    const formatted = `${clean.slice(0, 4)} ${clean.slice(4, 7)} ${clean.slice(7)}`;

    return dir === "rtl" ? `\u200E${formatted}` : formatted;
  }

  return clean;
};

export const formatCountdown = (totalSeconds: number): string => {
  if (totalSeconds <= 0) return "00 : 00";

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const paddedMins = minutes.toString().padStart(2, "0");
  const paddedSecs = seconds.toString().padStart(2, "0");

  return `${paddedMins} : ${paddedSecs}`;
};

/**
 * Formats seconds into HH:MM:SS
 * @param totalSeconds - Total elapsed seconds
 */
export const formatDuration = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const padded = (val: number) => val.toString().padStart(2, "0");

  if (hours > 0) {
    return `${padded(hours)}:${padded(minutes)}:${padded(seconds)}`;
  }

  return `${padded(minutes)}:${padded(seconds)}`;
};

/**
 * Formats the start and end time of an event.
 * @param startTime - Start time in HH:mm format
 * @param duration - Duration in minutes
 * @param endDate - Optional end date object
 * @param locale - Current locale
 */
export const formatEventTimeRange = (
  startTime: string,
  duration?: number,
  endDate?: Date,
  locale: string = "fa",
): string => {
  if (!startTime) return "";

  let result = startTime;

  if (duration) {
    const [hours, minutes] = startTime.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0);
    date.setMinutes(date.getMinutes() + duration);

    const endH = String(date.getHours()).padStart(2, "0");
    const endM = String(date.getMinutes()).padStart(2, "0");
    result = `${startTime} - ${endH}:${endM}`;
  } else if (endDate) {
    const endH = String(endDate.getHours()).padStart(2, "0");
    const endM = String(endDate.getMinutes()).padStart(2, "0");
    result = `${startTime} - ${endH}:${endM}`;
  }

  return replaceDigitsByLocale(result, locale);
};
