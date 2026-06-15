import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useI18n } from "#imports";
import type { Medication } from "~/types/medication";
import type { DropdownOption } from "~/types/components/select";

export const useMedicationStore = defineStore("medication", () => {
  const { locale } = useI18n();
  const mockMedicationData: Medication[] = [
    {
      id: 1,
      title: "استامینوفن",
      englishTitle: "Acetaminophen",
      brands: [
        { id: 101, title: "Calyptol" },
        { id: 102, title: "Panadol" },
      ],
    },
    {
      id: 2,
      title: "ایبوپروفن",
      englishTitle: "Ibuprofen",
      brands: [{ id: 201, title: "Advil" }],
    },
    {
      id: 3,
      title: "آموکسی‌سیلین",
      englishTitle: "Amoxicillin",
      brands: [{ id: 301, title: "Amoxil" }],
    },
    {
      id: 4,
      title: "آتورواستاتین",
      englishTitle: "Atorvastatin",
      brands: [{ id: 401, title: "Lipitor" }],
    },
    {
      id: 5,
      title: "متفورمین",
      englishTitle: "Metformin",
      brands: [{ id: 501, title: "Glucophage" }],
    },
  ];

  // --- State ---
  const medications = ref<Medication[]>(mockMedicationData);
  const searchResults = ref<Medication[]>([]);
  const isLoading = ref(false);
  let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

  // --- Getters ---

  /**
   * Converts the entire medication list into DropdownOptions
   * Dynamically handles locale for labels
   */
  const medicationOptions = computed((): DropdownOption[] => {
    return medications.value.map((med) => mapToDropdown(med));
  });

  /**
   * Getter function to find a specific medication by ID and return as DropdownOption
   */
  const getMedicationOptionById = computed(() => {
    return (id: number | string): DropdownOption | null => {
      const med = medications.value.find((m) => m.id === Number(id));
      return med ? mapToDropdown(med) : null;
    };
  });

  // --- Helper Methods ---

  /**
   * Internal mapper to handle the locale logic for English vs others
   */
  const mapToDropdown = (med: Medication): DropdownOption => {
    return {
      // If locale is 'en', use englishTitle, otherwise use primary title
      label: String(locale.value === "en" ? med.englishTitle : med.title),
      value: med.id,
    };
  };

  // --- Actions ---

  /**
   * Mock search function with built-in debounce and loading state
   */
  const searchMedications = (query: string) => {
    // Clear existing timeout to prevent multiple rapid calls
    if (debounceTimeout) clearTimeout(debounceTimeout);

    if (!query.trim()) {
      searchResults.value = [];
      return;
    }

    isLoading.value = true;

    debounceTimeout = setTimeout(() => {
      const q = query.toLowerCase();

      // Filter based on both Persian and English titles
      searchResults.value = medications.value.filter((med) => {
        return (
          med.title.toLowerCase().includes(q) ||
          med.englishTitle.toLowerCase().includes(q)
        );
      });

      isLoading.value = false;
    }, 500); // 500ms Debounce interval
  };

  return {
    medications,
    searchResults,
    isLoading,
    medicationOptions,
    getMedicationOptionById,
    searchMedications,
  };
});
