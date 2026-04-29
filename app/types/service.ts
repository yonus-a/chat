import type { Contact } from "./chat";
import type { Invoice } from "./invoice";

export interface Service {
  id: number;
  icon?: string;
  label: string;
  status?: "pending" | "approved" | "rejected" | "expired";
  provider?: Contact;
  invoice?: Invoice;
}
