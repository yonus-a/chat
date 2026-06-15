export interface Notification {
  id: number;
  title: string;
  description: string;
  date: Date;
  isRead: boolean;
  tag: "request" | "wallet" | "reminder" | "announcement";
  path: string;
}
