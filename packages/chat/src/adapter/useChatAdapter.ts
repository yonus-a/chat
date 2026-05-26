import { inject, provide, type InjectionKey } from 'vue';
import type { ChatDataAdapter } from './types';

/**
 * Injection key for the ChatDataAdapter.
 * Used internally by chat components to access the adapter.
 */
export const ChatAdapterKey: InjectionKey<ChatDataAdapter> = Symbol('ChatDataAdapter');

/**
 * Provide a ChatDataAdapter to all child chat components.
 * Call this in your root chat wrapper or App setup.
 *
 * @example
 * ```ts
 * import { provideChatAdapter } from '@behayand/chat';
 *
 * // In your setup function:
 * provideChatAdapter(myAdapter);
 * ```
 */
export function provideChatAdapter(adapter: ChatDataAdapter): void {
  provide(ChatAdapterKey, adapter);
}

/**
 * Inject the ChatDataAdapter provided by an ancestor component.
 * Used internally by chat components.
 *
 * @throws Error if no adapter has been provided
 */
export function useChatAdapter(): ChatDataAdapter {
  const adapter = inject(ChatAdapterKey);
  if (!adapter) {
    throw new Error(
      '[BehayandChat] No ChatDataAdapter provided. ' +
      'Please call provideChatAdapter() in a parent component or use the BehayandChat wrapper.',
    );
  }
  return adapter;
}
