import type { Medication } from "~/types/medication";

export interface MedicationAdapter {
  fetchMedications(): Promise<Medication[]>;

  searchMedications(query: string): Promise<Medication[]>;
}
