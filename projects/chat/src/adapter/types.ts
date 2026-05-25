import type {
  Contact,
  Message,
  FilterKeys,
  Service,
  Provider,
} from "../types";

/**
 * ChatDataAdapter interface.
 * Consumers implement this to connect the chat module to their backend API.
 */
export interface ChatDataAdapter {
  /** Current user ID */
  getCurrentUserId(): number;

  /** Fetch paginated conversations */
  fetchConversations(params: {
    filter: FilterKeys;
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<{ data: Contact[]; hasNextPage: boolean }>;

  /** Fetch messages for a conversation */
  fetchMessages(params: {
    conversationId: number;
    page: number;
    pageSize: number;
  }): Promise<{ data: Message[]; hasNextPage: boolean }>;

  /** Send message(s) — returns the server-confirmed messages with real IDs */
  sendMessage(messages: Message[]): Promise<Message[]>;

  /** Delete messages by IDs */
  deleteMessages(messageIds: number[]): Promise<void>;

  /** Edit a message */
  editMessage(messageId: number, newText: string): Promise<Message>;

  /** Upload a file and return the URL */
  uploadFile(
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<string>;

  /** Mark a conversation as read */
  markAsRead(conversationId: number): Promise<void>;

  /** Handle access request response (approve/reject) */
  handleAccessResponse?(params: {
    messageId: number;
    conversationId: number;
    action: "approve" | "reject";
  }): Promise<void>;

  /** Send a service request */
  sendServiceRequest?(params: {
    conversationId: number;
    serviceId: number;
    serviceLabel: string;
    providers: Provider[];
  }): Promise<Message>;

  /** Send personal info request */
  sendPersonalInfoRequest?(conversationId: number): Promise<Message>;

  /** Fetch services list (for medic features) */
  fetchServices?(): Promise<Service[]>;

  /** Fetch providers for a service */
  fetchProviders?(serviceId: number): Promise<Provider[]>;

  /** Fetch media/files for profile overview */
  fetchMediaFiles?(params: {
    conversationId: number;
    type: "media" | "file";
    page: number;
    pageSize: number;
  }): Promise<{ data: string[]; hasNextPage: boolean }>;
}
