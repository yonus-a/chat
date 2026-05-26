// Main component
export { default as BehayandChat } from "./BehayandChat.vue";

// Adapter
export { provideChatAdapter, useChatAdapter, ChatAdapterKey } from "./adapter/useChatAdapter";
export { MockChatAdapter } from "./adapter/MockChatAdapter";

// Types
export type {
  ChatMessage,
  ChatContact,
  ExtendedChatMessage,
  ChatConfig,
  ChatFilter,
  FilterKeys,
  MessageType,
  MessageStatus,
  PaginatedResult,
  SendMessagePayload,
} from "./types";

export type { ChatDataAdapter } from "./adapter/types";

// Plugin installer
export { createBehayandChat } from "./plugin";
