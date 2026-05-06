export type CalendarMode = "daily" | "weekly" | "monthly";

export interface CalendarDateRange {
  start: Date;
  end: Date;
}

export interface CalendarTimeRange {
  start: number;
  end: number;
}

export interface CalendarDay {
  date: Date;
  primary: number;
  secondary: number;
  tertiary: number;
  jalaali: number;
  gregorian: number;
  ghamari: number;
  isToday: boolean;
  isWeekend: boolean;
  name: string;
  shortName: string;
  dayOfWeek: number;
}

export interface CalendarEvent {
  id: number;
  startDate: Date;
  endDate: Date;
}
