import { useNuxtApp } from "#imports";
import type { AppStores } from "./createStores";

export const useMedicationStore = () => {
  const { $appStores } = useNuxtApp() as unknown as {
    $appStores: AppStores;
  };
  return $appStores.useMedicationStore();
};
