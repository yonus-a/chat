import { injectAppStores } from "~/nuxt-shims";

export const useChatStore = () => injectAppStores().useChatStore();
