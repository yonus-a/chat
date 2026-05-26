// Types
export type {
  Message,
  MessageType,
  Contact,
  FilterKeys,
  ChatFilter,
  ExtendedMessage,
  Request,
  AccessRequest,
  ServiceRequest,
  RequestProvider,
  RequestStatus,
  CurrentUser,
  PaginatedContacts,
  PaginatedMessages,
} from "./types";

// Adapter
export type { ChatDataAdapter } from "./adapter/types";
export {
  ChatAdapterKey,
  provideChatAdapter,
  useChatAdapter,
} from "./adapter/useChatAdapter";

// Mock adapter for development
export { MockChatAdapter } from "./adapter/MockChatAdapter";
