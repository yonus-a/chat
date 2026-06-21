import { injectAppStores } from "~/nuxt-shims";

export const useMedicationStore = () => injectAppStores().useMedicationStore();
