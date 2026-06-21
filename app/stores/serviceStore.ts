import { injectAppStores } from "~/nuxt-shims";

export const useServiceStore = () => injectAppStores().useServiceStore();
