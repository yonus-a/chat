import { injectAppStores } from "~/nuxt-shims";

export const useCallStore = () => injectAppStores().useCallStore();
 