import { inject, provide, type InjectionKey } from "vue";
import type { ChatDataAdapter } from "./types";

export const ChatAdapterKey: InjectionKey<ChatDataAdapter> =
  Symbol("ChatDataAdapter");

/**
 * Provide a ChatDataAdapter to all child components.
 * Call this in your root component or app setup.
 */
export function provideChatAdapter(adapter: ChatDataAdapter): void {
  provide(ChatAdapterKey, adapter);
}

/**
 * Inject the ChatDataAdapter. Must be called within a component
 * that is a descendant of a component that called provideChatAdapter().
 */
export function useChatAdapter(): ChatDataAdapter {
  const adapter = inject(ChatAdapterKey);
  if (!adapter) {
    throw new Error(
      "[BehayandChat] No ChatDataAdapter provided. " +
        "Make sure to call provideChatAdapter(), install createBehayandChat(), or pass an adapter prop to BehayandChat.",
    );
  }
  return adapter;
}
