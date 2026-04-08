import { useI18n } from "#imports";
import toJalaali from "jalaali-js";

export interface DateFormatOptions {
  /** If true, includes the day of the week (e.g., Monday, دوشنبه) */
  showWeekday?: boolean;
  /** If true, replaces the weekday with 'Today' or 'Yesterday' if applicable */
  useRelativeDay?: boolean;
  /** If true, appends the time (e.g., 14:30) at the end */
  showTime?: boolean;
  /** Use 'short' for abbreviated months in English/Arabic */
  monthFormat?: "short" | "long";
}

export const useDate = () => {
  const { locale } = useI18n();

  // Internal Dictionary for Time/Relative Words
  const dict = {
    en: {
      today: "Today",
      yesterday: "Yesterday",
      ago: "ago",
      min: "min",
      hr: "h",
      day: "d",
    },
    fa: {
      today: "امروز",
      yesterday: "دیروز",
      ago: "پیش",
      min: "دقیقه",
      hr: "ساعت",
      day: "روز",
    },
    ar: {
      today: "اليوم",
      yesterday: "أمس",
      ago: "مضت",
      min: "دقيقة",
      hr: "ساعة",
      day: "يوم",
    },
  };

  // --- Core Helpers ---

  const getLang = (): "en" | "fa" | "ar" => {
    const current = locale.value as string;
    if (current.includes("fa")) return "fa";
    if (current.includes("ar")) return "ar";
    return "en";
  };

  const localizeDigits = (
    str: string | number,
    lang: "en" | "fa" | "ar",
  ): string => {
    if (lang === "fa")
      return String(str).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
    if (lang === "ar")
      return String(str).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]); // Eastern Arabic Numerals
    return String(str);
  };

  const parseDate = (dateInput: string | Date): Date => {
    return typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  const isToday = (date: Date) => isSameDay(date, new Date());

  const isYesterday = (date: Date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return isSameDay(date, yesterday);
  };

  // --- Persian Specific Data ---

  const getJalaaliMonthName = (monthIndex: number): string => {
    const months = [
      "فروردین",
      "اردیبهشت",
      "خرداد",
      "تیر",
      "مرداد",
      "شهریور",
      "مهر",
      "آبان",
      "آذر",
      "دی",
      "بهمن",
      "اسفند",
    ];
    return months[monthIndex - 1] || "";
  };

  const getJalaaliDayOfWeekName = (date: Date): string => {
    const days = [
      "یکشنبه",
      "دوشنبه",
      "سه‌شنبه",
      "چهارشنبه",
      "پنج‌شنبه",
      "جمعه",
      "شنبه",
    ];
    return days[date.getDay()];
  };

  // --- Formatting Logic ---

  const formatTime = (dateInput: string | Date): string => {
    const date = parseDate(dateInput);
    const lang = getLang();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const timeStr = `${hours}:${minutes}`;
    return localizeDigits(timeStr, lang);
  };
  /**
   * Master Date Formatter
   * Can format dates cleanly across 3 languages with precise toggles.
   */
  const formatDate = (
    dateInput: string | Date,
    options: DateFormatOptions = {},
  ): string => {
    const opts: DateFormatOptions = {
      showWeekday: true,
      useRelativeDay: true,
      showTime: false,
      monthFormat: "long",
      ...options,
    };
    const date = parseDate(dateInput);
    const lang = getLang();

    const isRtl = lang === "fa" || lang === "ar";
    const separator = isRtl ? "، " : ", "; // Standard Arabic comma vs English comma

    // 1. Resolve Prefix (Today / Yesterday / Weekday Name)
    let prefix = "";
    if (opts.useRelativeDay && isToday(date)) {
      prefix = dict[lang].today;
    } else if (opts.useRelativeDay && isYesterday(date)) {
      prefix = dict[lang].yesterday;
    } else if (opts.showWeekday) {
      if (lang === "fa") {
        prefix = getJalaaliDayOfWeekName(date);
      } else {
        // Native Intl handling for En & Ar (Gregorian)
        prefix = new Intl.DateTimeFormat(
          lang === "ar" ? "ar-EG-u-ca-gregory" : "en-US",
          { weekday: "long" },
        ).format(date);
      }
    }

    // 2. Resolve Main Date Body
    let body = "";
    if (lang === "fa") {
      const jDate = toJalaali.toJalaali(date);
      body = `${localizeDigits(jDate.jd, lang)} ${getJalaaliMonthName(jDate.jm)} ${localizeDigits(jDate.jy, lang)}`;
    } else {
      // Native Intl handling for En & Ar (Gregorian)
      body = new Intl.DateTimeFormat(
        lang === "ar" ? "ar-EG-u-ca-gregory" : "en-US",
        {
          day: "numeric",
          month: opts.monthFormat,
          year: "numeric",
        },
      ).format(date);
    }

    // 3. Assemble Date Parts
    let finalString = prefix ? `${prefix}${separator}${body}` : body;

    // 4. Append Time if requested
    if (opts.showTime) {
      const timeDash = isRtl ? " - " : " - ";
      finalString += `${timeDash}${formatTime(date, lang)}`;
    }

    return finalString;
  };

  /**
   * Social Media Style Relative Time (e.g., 2 hours ago)
   */
  const getRelativeTime = (dateInput: string | Date): string => {
    const date = parseDate(dateInput);
    const now = new Date();
    const diffMs = Math.max(now.getTime() - date.getTime(), 0);

    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    const lang = getLang();
    const tDict = dict[lang];

    if (diffDays < 7) {
      if (diffMinutes < 60) {
        const val = diffMinutes || 1;
        return lang === "en"
          ? `${val} ${tDict.min} ${tDict.ago}`
          : `${localizeDigits(val, lang)} ${tDict.min} ${tDict.ago}`;
      }
      if (diffHours < 24) {
        return lang === "en"
          ? `${diffHours}${tDict.hr} ${tDict.ago}`
          : `${localizeDigits(diffHours, lang)} ${tDict.hr} ${tDict.ago}`;
      }
      return lang === "en"
        ? `${diffDays}${tDict.day} ${tDict.ago}`
        : `${localizeDigits(diffDays, lang)} ${tDict.day} ${tDict.ago}`;
    }

    // Fallback for older dates
    return formatDate(date, {
      showWeekday: false,
      useRelativeDay: false,
      showTime: true,
      monthFormat: "short",
    });
  };

  const formatNumericDate = (dateInput: string | Date): string => {
    const date = parseDate(dateInput);
    const lang = getLang();

    let y, m, d;

    if (lang === "fa") {
      const jDate = toJalaali.toJalaali(date);
      y = jDate.jy;
      m = String(jDate.jm).padStart(2, "0");
      d = String(jDate.jd).padStart(2, "0");
    } else {
      y = date.getFullYear();
      m = String(date.getMonth() + 1).padStart(2, "0");
      d = String(date.getDate()).padStart(2, "0");
    }

    const dateStr = `${y}/${m}/${d}`;
    return localizeDigits(dateStr, lang);
  };

  const formatDateTime = (dateInput: string | Date): string => {
    const date = parseDate(dateInput);
    const lang = getLang();

    let body = "";
    if (lang === "fa") {
      const jDate = toJalaali.toJalaali(date);
      body = `${jDate.jd} ${getJalaaliMonthName(jDate.jm)} ${jDate.jy}`;
    } else {
      body = new Intl.DateTimeFormat(
        lang === "ar" ? "ar-EG-u-ca-gregory" : "en-US",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        },
      ).format(date);
    }

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const timeStr = `${hours}:${minutes}`;

    // Combine date body and time with a simple space
    const combined = `${body}  ${timeStr}`;

    // Localize all digits at once
    return localizeDigits(combined, lang);
  };

  return {
    parseDate,
    formatNumericDate,
    formatDate, // Use this everywhere for general formatting
    getRelativeTime,
    formatFullDate: formatDate,
    formatTime,
    formatDateTime,
    // Exposing under the old name as an alias so existing code doesn't break
  };
};
