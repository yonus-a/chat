import { replaceDigitsWithPersian } from "../utils/format";
import { getChatLocale } from "../i18n";

const FA_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

const FA_WEEKDAYS = [
  "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه",
];

/**
 * Convert Gregorian date to Jalali (Solar Hijri)
 */
function toJalali(date: Date): { year: number; month: number; day: number } {
  const gy = date.getFullYear();
  const gm = date.getMonth() + 1;
  const gd = date.getDate();

  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    g_d_m[gm - 1];

  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;

  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  let jm: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    const jd = 1 + (days % 31);
    return { year: jy, month: jm, day: jd };
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    const jd = 1 + ((days - 186) % 30);
    return { year: jy, month: jm, day: jd };
  }
}

export function useDate() {
  const locale = getChatLocale();

  function formatDateShort(date: Date | string): string {
    const d = new Date(date);
    if (locale === "fa") {
      const j = toJalali(d);
      return `${replaceDigitsWithPersian(String(j.day))} ${FA_MONTHS[j.month - 1]}`;
    }
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function formatDateFull(date: Date | string): string {
    const d = new Date(date);
    if (locale === "fa") {
      const j = toJalali(d);
      const weekday = FA_WEEKDAYS[d.getDay()];
      return `${weekday} ${replaceDigitsWithPersian(String(j.day))} ${FA_MONTHS[j.month - 1]} ${replaceDigitsWithPersian(String(j.year))}`;
    }
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatTime(date: Date | string): string {
    const d = new Date(date);
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    const time = `${h}:${m}`;
    return locale === "fa" ? replaceDigitsWithPersian(time) : time;
  }

  function formatRelativeDate(date: Date | string): string {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (locale === "fa") {
      if (diffMins < 1) return "همین الان";
      if (diffMins < 60) return `${replaceDigitsWithPersian(String(diffMins))} دقیقه پیش`;
      if (diffHours < 24) return `${replaceDigitsWithPersian(String(diffHours))} ساعت پیش`;
      if (diffDays < 7) return `${replaceDigitsWithPersian(String(diffDays))} روز پیش`;
      return formatDateShort(d);
    }

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDateShort(d);
  }

  function isSameDay(d1: Date | string, d2: Date | string): boolean {
    const a = new Date(d1);
    const b = new Date(d2);
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function isToday(date: Date | string): boolean {
    return isSameDay(date, new Date());
  }

  function calculateAge(birthDate: Date | string): number {
    const d = new Date(birthDate);
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) {
      age--;
    }
    return age;
  }

  return {
    formatDateShort,
    formatDateFull,
    formatTime,
    formatRelativeDate,
    isSameDay,
    isToday,
    calculateAge,
  };
}
