import type { ChatAdapter } from "./ports/ChatAdapter";
import type { ChatActionAdapter } from "./ports/ChatActionAdapter";
import type { ServiceAdapter } from "./ports/ServiceAdapter";
import type { MedicationAdapter } from "./ports/MedicationAdapter";

export interface HostAdapter {
  chat: ChatAdapter;
  chatAction: ChatActionAdapter;
  service: ServiceAdapter;
  medication: MedicationAdapter;
}
