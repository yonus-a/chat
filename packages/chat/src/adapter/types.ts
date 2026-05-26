import type {
  Contact,
  CurrentUser,
  FilterKeys,
  Message,
  PaginatedContacts,
  PaginatedMessages,
} from "../types";

/**
 * ChatDataAdapter interface.
 *
 * Implement this interface to connect the chat UI to your real backend.
 * All data fetching and mutations flow through this adapter.
 */
export interface ChatDataAdapter {
  /**
   * Returns the current authenticated user info.
   */
  getCurrentUser(): CurrentUser;

  /**
   * Fetch a paginated list of conversations (contacts).
   *
   * @param filter - Filter key ("", "online", "ended", "active")
   * @param page - Page number (1-based)
   * @param pageSize - Number of items per page
   * @param search - Optional search query
   */
  fetchConversations(
    filter: FilterKeys,
    page: number,
    pageSize: number,
    search?: string,
  ): Promise<PaginatedContacts>;

  /**
   * Fetch paginated messages for a specific conversation.
   *
   * @param conversationId - The conversation ID
   * @param page - Page number (1-based)
   * @param pageSize - Number of messages per page
   */
  fetchMessages(
    conversationId: number,
    page: number,
    pageSize: number,
  ): Promise<PaginatedMessages>;

  /**
   * Send one or more messages to a conversation.
   * Returns the messages with server-assigned IDs and isSent=true.
   *
   * @param messages - Array of messages to send
   */
  sendMessages(messages: Message[]): Promise<Message[]>;

  /**
   * Edit a message's text content.
   *
   * @param messageId - The message ID to edit
   * @param newText - The updated text
   */
  editMessage(messageId: number, newText: string): Promise<Message>;

  /**
   * Delete one or more messages.
   *
   * @param messageIds - Array of message IDs to delete
   */
  deleteMessages(messageIds: number[]): Promise<void>;

  /**
   * Mark a conversation as read.
   *
   * @param conversationId - The conversation ID
   */
  markAsRead(conversationId: number): Promise<void>;

  /**
   * Fetch contact details by ID.
   *
   * @param contactId - The contact ID
   */
  getContactById(contactId: number): Promise<Contact | null>;

  /**
   * Upload a file and return the URL.
   * Optional - if not provided, file uploads won't be supported.
   *
   * @param file - The file to upload
   * @param onProgress - Progress callback (0-100)
   */
  uploadFile?(
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<string>;
}
