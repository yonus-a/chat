import { injectAppStores } from "~/nuxt-shims";

export const useChatActionStore = () => injectAppStores().useChatActionStore();
