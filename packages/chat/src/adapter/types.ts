import type {
  ChatContact,
  ChatMessage,
  FilterKeys,
  PaginatedResult,
  SendMessagePayload,
} from "../types";

/**
 * ChatDataAdapter interface.
 * Consumers must implement this interface to provide data to the chat component.
 * This decouples the chat UI from any specific backend or data source.
 */
export interface ChatDataAdapter {
  /**
   * Fetch a paginated list of conversations/contacts.
   */
  fetchContacts(params: {
    filter: FilterKeys;
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<PaginatedResult<ChatContact>>;

  /**
   * Fetch messages for a specific conversation.
   */
  fetchMessages(params: {
    conversationId: number | string;
    page: number;
    pageSize: number;
  }): Promise<PaginatedResult<ChatMessage>>;

  /**
   * Send a new message.
   */
  sendMessage(payload: SendMessagePayload): Promise<ChatMessage>;

  /**
   * Edit an existing message.
   */
  editMessage(params: {
    messageId: number | string;
    text: string;
  }): Promise<ChatMessage>;

  /**
   * Delete messages by IDs.
   */
  deleteMessages(messageIds: (number | string)[]): Promise<void>;

  /**
   * Mark a conversation as read.
   */
  markAsRead(conversationId: number | string): Promise<void>;

  /**
   * Upload a file attachment and return a URL.
   */
  uploadFile?(params: {
    file: File;
    conversationId: number | string;
    onProgress?: (progress: number) => void;
  }): Promise<string>;

  /**
   * Optional: Get the current user's profile info.
   */
  getCurrentUser?(): { id: number | string; name: string; imageUrl?: string };

  /**
   * Optional: Called when user initiates a call.
   */
  onCallInitiated?(params: {
    contactId: number | string;
    type: "voice" | "video";
  }): void;
}
