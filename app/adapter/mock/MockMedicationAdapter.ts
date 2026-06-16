import type { MedicationAdapter } from "../ports/MedicationAdapter";
import type { Medication } from "~/types/medication";
import { seedMedications, seedMedicationSearch, delay } from "~/mock";

export interface MockMedicationAdapterOptions {
  latencyMs?: number;
  searchLatencyMs?: number;
}

export const createMockMedicationAdapter = (
  opts: MockMedicationAdapterOptions = {},
): MedicationAdapter => {
  const { latencyMs = 200, searchLatencyMs = 250 } = opts;

  return {
    async fetchMedications(): Promise<Medication[]> {
      await delay(latencyMs);
      return seedMedications();
    },

    async searchMedications(query: string): Promise<Medication[]> {
      await delay(searchLatencyMs);
      return seedMedicationSearch(query);
    },
  };
};
