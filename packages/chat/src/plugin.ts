import type { App, Plugin } from "vue";
import type { ChatDataAdapter } from "./adapter/types";
import type { ChatConfig } from "./types";
import { ChatAdapterKey } from "./adapter/useChatAdapter";
import BehayandChat from "./BehayandChat.vue";

export interface BehayandChatPluginOptions {
  adapter: ChatDataAdapter;
  config?: ChatConfig;
}

/**
 * Vue plugin to install BehayandChat globally.
 * 
 * Usage:
 * ```ts
 * import { createBehayandChat } from '@behayand/chat'
 * import { MyAdapter } from './my-adapter'
 * 
 * app.use(createBehayandChat({
 *   adapter: new MyAdapter(),
 *   config: { currentUserId: 1, direction: 'rtl' }
 * }))
 * ```
 */
export function createBehayandChat(options: BehayandChatPluginOptions): Plugin {
  return {
    install(app: App) {
      app.provide(ChatAdapterKey, options.adapter);
      app.component("BehayandChat", BehayandChat);
    },
  };
}
