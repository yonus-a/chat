export type EventCategory = "task" | "medicine" | "event";
export type RepetitionCycleType = "day" | "hour" | "custom";
export type RepetitionEndType = "date" | "times";

export interface EventChecklistItem {
  id?: number;
  text: string;
  isChecked: boolean;
}

// Strictly types Step 3 Data
export interface EventRepetitionConfig {
  repetitionStart: string | Date;
  repetitionType: RepetitionCycleType;
  repeatTimeCycle: number;
  selectedDays?: number[]; // e.g., for Sunday, Tuesday, Thursday
  wholeDay: boolean;
  chosenTime: string;
  isReminder: boolean;
  selectedReminder?: number; // Minutes before
  repeatitionEnd: RepetitionEndType;
  repetitionAmount: string | number; // Date string if 'date', number if 'times'
}

// The Final Combined Payload from MainPopup.vue
export interface CalendarEventPayload {
  id?: number;
  
  // --- Step 1: Details ---
  eventType: EventCategory;
  title: string;
  description: string;
  selectedUsers?: number[]; // Array of Contact IDs
  attachement?: string;
  color?: string;
  checkList?: EventChecklistItem[];

  // --- Step 2: Timing ---
  date: string | Date;
  time: string;
  isFullDay: boolean;
  hasRepetition: boolean;

  // --- Step 3: Repetition (Optional) ---
  repetition?: EventRepetitionConfig;
}