import type { CalendarEvent } from "./components/calendar";
import type { Contact } from "./chat";
export type ShareTypes = "viewer" | "editor";

export interface SharedUserCalendar extends Contact {
  accessType: ShareTypes;
}

export enum WeekDays {
  Saturday,
  Sunday,
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
}

export enum RepetitionTypes {
  Custom,
  Daily,
  Hourly,
}

export enum EventType {
  Medicine,
  AI,
  Service,
  Task,
}

export interface EventCheckList {
  id?: number;
  text: string;
  isChecked: boolean;
}

export interface EventRepetition {
  repeatingDays: WeekDays | number;
  startDate: Date;
  endDate?: Date;
}

export interface CalendarEventData extends CalendarEvent {
  title: string;
  description: string;
  checklist?: EventCheckList[];
  attachement?: string;
  color: string;
  users: Contact[];
  callId?: number;
  type: EventType;
  repetition?: EventRepetition;
}
