import { inject, provide, type InjectionKey } from "vue";
import type { ChatDataAdapter } from "./types";

/**
 * Vue injection key for the ChatDataAdapter.
 */
export const ChatAdapterKey: InjectionKey<ChatDataAdapter> =
  Symbol("ChatDataAdapter");

/**
 * Provide a ChatDataAdapter instance to the component tree.
 * Call this in your app's root component or a parent of the chat UI.
 *
 * @example
 * ```ts
 * import { provideChatAdapter } from '@behayand/chat'
 * import { MyApiAdapter } from './my-adapter'
 *
 * // In setup()
 * provideChatAdapter(new MyApiAdapter())
 * ```
 */
export function provideChatAdapter(adapter: ChatDataAdapter): void {
  provide(ChatAdapterKey, adapter);
}

/**
 * Inject the ChatDataAdapter instance from the component tree.
 * Used internally by the chat components.
 *
 * @throws Error if no adapter has been provided
 */
export function useChatAdapter(): ChatDataAdapter {
  const adapter = inject(ChatAdapterKey);
  if (!adapter) {
    throw new Error(
      "[@behayand/chat] No ChatDataAdapter provided. " +
        "Call provideChatAdapter() in a parent component or use the `adapter` prop on BehayandChat.",
    );
  }
  return adapter;
}
