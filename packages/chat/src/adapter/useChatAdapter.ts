import { inject, provide, type InjectionKey } from "vue";
import type { ChatDataAdapter } from "./types";

const CHAT_ADAPTER_KEY: InjectionKey<ChatDataAdapter> =
  Symbol("chat-adapter");

/**
 * Provide a ChatDataAdapter to all chat components.
 * Call this in the parent/root component that mounts the chat.
 */
export function provideChatAdapter(adapter: ChatDataAdapter) {
  provide(CHAT_ADAPTER_KEY, adapter);
}

/**
 * Inject the ChatDataAdapter. Used internally by stores and components.
 * Throws if no adapter was provided.
 */
export function useChatAdapter(): ChatDataAdapter {
  const adapter = inject(CHAT_ADAPTER_KEY);
  if (!adapter) {
    throw new Error(
      "[@behayand/chat] No ChatDataAdapter provided. " +
        "Call provideChatAdapter() in a parent component.",
    );
  }
  return adapter;
}

export { CHAT_ADAPTER_KEY };
