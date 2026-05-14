import { computed } from "vue";
import { useLocale, useCalendarStore } from "#imports";
import type { Option } from "~/components/global/BMenu.vue";

export const useCalendarDate = () => {
  const { locale } = useLocale();

  const calendarMap = {
    ar: "islamic-uma",
    en: "gregory",
    fa: "persian",
  };

  // Helper to get the 2-letter language code safely
  const getActiveCalendar = computed(() => {
    const cal = settings.value.calendar;
    if (cal === "jalaali") return "persian";
    if (cal === "islamic") return "islamic-uma";
    return "gregory"; // Default for georgian
  });

  const calendarStore = useCalendarStore(); // ADDED
  const settings = computed(() => calendarStore.settings); // ADDED

  // ADDED: Helper to map 'saturday' -> 6, 'sunday' -> 0, etc.
  const dayToNumber = (dayName: string): number => {
    const map: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };
    return map[dayName.toLowerCase()] ?? 0;
  };

  const getYears = computed((): Option[] => {
    const calendar = getActiveCalendar.value;
    const lang = String(locale.value).split("-");

    const rawFormatter = new Intl.DateTimeFormat(`en-u-ca-${calendar}`, {
      year: "numeric",
    });
    const currentYear = parseInt(
      rawFormatter.format(new Date()).replace(/[^0-9]/g, ""),
    );

    const labelFormatter = new Intl.DateTimeFormat(`${lang}-u-ca-${calendar}`, {
      year: "numeric",
    });

    const years: Option[] = [];
    const baseDate = new Date();

    // Changed from - 5 to - 100
    for (let i = currentYear - 100; i <= currentYear + 100; i++) {
      const date = new Date(baseDate);
      date.setFullYear(baseDate.getFullYear() + (i - currentYear));

      years.push({
        key: String(i),
        label: labelFormatter.format(date),
      });
    }
    return years;
  });

  const getMonths = computed((): Option[] => {
    const calendar = getActiveCalendar.value;
    const lang = String(locale.value).split("-")[0];
    const months: Option[] = [];

    const formatter = new Intl.DateTimeFormat(`${lang}-u-ca-${calendar}`, {
      month: "long",
    });

    for (let i = 1; i <= 12; i++) {
      let date: Date;
      // Fixed reference dates for calendar accuracy
      if (calendar === "persian") {
        date = new Date(Date.UTC(2024, 2 + (i - 1), 22));
      } else if (calendar === "islamic-uma") {
        date = new Date(Date.UTC(2024, 6, 7 + (i - 1) * 29.5));
      } else {
        date = new Date(Date.UTC(2024, i - 1, 15));
      }

      months.push({
        key: String(i),
        label: formatter.format(date),
      });
    }
    return months;
  });

  // Type-agnostic lookup (handles strings or numbers)
  const getYearIndex = (yearKey: string | number): number => {
    const search = String(yearKey);
    return getYears.value.findIndex((item) => item.key === search);
  };

  const getMonthIndex = (monthKey: string | number): number => {
    const search = String(monthKey);
    return getMonths.value.findIndex((item) => item.key === search);
  };

  // NEW: Helper for today's indices to prevent -1 on mount
  const getTodayIndices = () => {
    const calendar = getActiveCalendar.value;
    const yFmt = new Intl.DateTimeFormat(`en-u-ca-${calendar}`, {
      year: "numeric",
    });
    const mFmt = new Intl.DateTimeFormat(`en-u-ca-${calendar}`, {
      month: "numeric",
    });

    const yKey = yFmt.format(new Date()).replace(/[^0-9]/g, "");
    const mKey = mFmt.format(new Date()).replace(/[^0-9]/g, "");

    return {
      yearIndex: getYearIndex(yKey),
      monthIndex: getMonthIndex(mKey),
    };
  };

  const getParts = (date: Date) => {
    // 1. Clone the date and set to NOON to prevent midnight timezone/DST shifting
    const safeDate = new Date(date);
    safeDate.setHours(12, 0, 0, 0);

    let cal = getActiveCalendar.value;

    // 2. Sync Ghamari (Hijri) logic with getDayDetails
    if (cal === "islamic-uma") {
      cal = "islamic-civil"; // Best engine support
      safeDate.setDate(safeDate.getDate() - 1); // Apply the exact same -1 day offset
    }

    // 3. Extract parts
    const parts = new Intl.DateTimeFormat(`en-u-ca-${cal}`, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).formatToParts(safeDate);

    const find = (type: string) =>
      parseInt(parts.find((p) => p.type === type)?.value || "0");

    return { year: find("year"), month: find("month"), day: find("day") };
  };

  // Fast boundary finder (Max 60 small iterations, zero crashes)
  const getMonthBounds = (date: Date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    let p = getParts(start);
    const targetMonth = p.month;

    // Step back to day 1
    while (p.day !== 1) {
      start.setDate(start.getDate() - 1);
      p = getParts(start);
    }

    // Step forward to last day
    const end = new Date(start);
    while (true) {
      end.setDate(end.getDate() + 1);
      if (getParts(end).month !== targetMonth) {
        end.setDate(end.getDate() - 1);
        break;
      }
    }
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  // Safely sets a specific localized month/year from dropdowns
  const setTargetMonth = (
    targetYear: number,
    targetMonth: number,
    currentDate: Date,
  ) => {
    let d = new Date(currentDate);
    d.setHours(0, 0, 0, 0);
    let p = getParts(d);

    // Jump roughly by Gregorian years
    if (p.year !== targetYear)
      d.setFullYear(d.getFullYear() + (targetYear - p.year));

    // Refine jump by 15-day increments to hit target month safely
    let failsafe = 0;
    while (
      (p.year !== targetYear || p.month !== targetMonth) &&
      failsafe++ < 50
    ) {
      if (
        p.year < targetYear ||
        (p.year === targetYear && p.month < targetMonth)
      )
        d.setDate(d.getDate() + 15);
      else d.setDate(d.getDate() - 15);
      p = getParts(d);
    }

    return getMonthBounds(d).start; // Return day 1
  };

  const getDayDetails = (date: Date) => {
    const lang = String(locale.value).split("-")[0];

    // --- HIJRI OFFSET ---
    // Iran's Ghamari calendar is often 1 day behind the standard Intl algorithms.
    const hijriOffsetDays = -1;
    const ghamariDate = new Date(date);
    ghamariDate.setDate(ghamariDate.getDate() + hijriOffsetDays);

    // Fast number extractor that accepts an optional target date
    const getDayNum = (cal: string, targetDate: Date = date) => {
      const parts = new Intl.DateTimeFormat(`en-u-ca-${cal}`, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }).formatToParts(targetDate);
      return parseInt(parts.find((p) => p.type === "day")?.value || "0");
    };

    // Extract days, passing the offset date ONLY to the Ghamari calculation
    const gregorian = getDayNum("gregory");
    const jalaali = getDayNum("persian");
    const ghamari = getDayNum("islamic-civil", ghamariDate);

    // Mapping based on locale requirements
    const activeCalSetting = settings.value.calendar;

    // Mapping based on Store Settings
    let primary, secondary, tertiary;
    if (activeCalSetting === "jalaali") {
      primary = jalaali;
      secondary = gregorian;
      tertiary = ghamari;
    } else if (activeCalSetting === "islamic") {
      primary = ghamari;
      secondary = gregorian;
      tertiary = jalaali;
    } else {
      // 'georgian' default
      primary = gregorian;
      secondary = jalaali;
      tertiary = ghamari;
    }

    // Checking if today
    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    // Checking if weekend (Friday for FA/AR, Sunday & Saturday for EN)
    const dayOfWeek = date.getDay();
    const isWeekend = settings.value.showHolidays
      ? activeCalSetting === "jalaali" || activeCalSetting === "islamic"
        ? dayOfWeek === 5 // Friday
        : dayOfWeek === 0 || dayOfWeek === 6 // Sunday/Saturday
      : false;

    // Localized names
    const activeCal = getActiveCalendar.value;
    const name = new Intl.DateTimeFormat(`${lang}-u-ca-${activeCal}`, {
      weekday: "long",
    }).format(date);
    const shortName = new Intl.DateTimeFormat(`${lang}-u-ca-${activeCal}`, {
      weekday: "short",
    }).format(date);

    return {
      date: new Date(date),
      primary,
      secondary,
      tertiary,
      jalaali,
      gregorian,
      ghamari,
      isToday,
      isWeekend,
      name,
      shortName,
      dayOfWeek,
    };
  };

  const getStartOfWeek = (date: Date): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    const day = d.getDay(); // 0 (Sun) to 6 (Sat)

    // Use the setting from the store
    const weekStartDay = dayToNumber(settings.value.startOfWeek);

    const diff = (day < weekStartDay ? 7 : 0) + day - weekStartDay;
    d.setDate(d.getDate() - diff);

    return d;
  };
  // Generates the array of days for the grid header
  const getCalendarHeaders = (
    range: { start: Date; end: Date } | null,
    mode: "daily" | "weekly" | "monthly",
  ) => {
    if (!range) return [];

    const days = [];
    const start = new Date(range.start);
    start.setHours(0, 0, 0, 0);

    if (mode === "monthly") {
      const gridStart = getStartOfWeek(start);
      const monthEnd = new Date(range.end);

      let d = new Date(gridStart);

      while (d <= monthEnd || days.length % 7 !== 0) {
        days.push(getDayDetails(new Date(d)));
        d.setDate(d.getDate() + 1);

        if (days.length >= 42) break;
      }
    } else if (mode === "weekly") {
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        days.push(getDayDetails(d));
      }
    } else {
      // Daily: Just the 1 day
      days.push(getDayDetails(start));
    }

    return days;
  };

  const getWeekDayNames = computed(() => {
    const lang = String(locale.value).split("-");
    const calendar = getActiveCalendar.value;

    const weekStartDay = dayToNumber(settings.value.startOfWeek);

    // Jan 12, 2025 is a known Sunday. Add the weekStartDay to shift it correctly.
    const start = new Date(2025, 0, 12 + weekStartDay);

    const narrowFormatter = new Intl.DateTimeFormat(
      `${lang}-u-ca-${calendar}`,
      { weekday: "narrow" },
    );

    const fullFormatter = new Intl.DateTimeFormat(`${lang}-u-ca-${calendar}`, {
      weekday: "long",
    });

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return {
        dayOfWeek: d.getDay(),
        label: narrowFormatter.format(d),
        fullName: fullFormatter.format(d),
      };
    });
  });

  return {
    getYears,
    getMonths,
    getWeekDayNames,
    getYearIndex,
    getMonthIndex,
    getTodayIndices,
    getParts,
    getMonthBounds,
    setTargetMonth,
    getCalendarHeaders,
    getDayDetails,
  };
};
