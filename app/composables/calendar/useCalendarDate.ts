import { computed } from "vue";
import { useLocale } from "#imports";
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
    const lang = String(locale.value).split("-")[0];
    return calendarMap[lang as keyof typeof calendarMap] || "gregory";
  });

  const getYears = computed((): Option[] => {
    const calendar = getActiveCalendar.value;
    const lang = String(locale.value).split("-")[0];

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

    for (let i = currentYear - 5; i <= currentYear + 100; i++) {
      // Create a display label for each year
      const date = new Date(baseDate);
      date.setFullYear(baseDate.getFullYear() + (i - currentYear));

      years.push({
        key: String(i), // Explicitly stringify
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
    const cal = getActiveCalendar.value;
    const parts = new Intl.DateTimeFormat(`en-u-ca-${cal}`, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).formatToParts(date);
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

  return {
    getYears,
    getMonths,
    getYearIndex,
    getMonthIndex,
    getTodayIndices,
    getParts,
    getMonthBounds,
    setTargetMonth,
  };
};
