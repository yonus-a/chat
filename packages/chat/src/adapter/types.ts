import type { Message, Contact, FilterKeys } from '../types/chat';
import type { Profile, UserRoleKey } from '../types/profile';
import type { Service, Provider } from '../types/service';
import type { Ref, ComputedRef } from 'vue';

/**
 * ChatDataAdapter
 *
 * This is the main interface that consumers must implement to provide
 * chat data from their own APIs. Each method/property maps to data
 * that was previously managed internally by mock stores.
 */
export interface ChatDataAdapter {
  // ─── Chat Store Data ────────────────────────────────────────────────
  /** Reactive map of filter key → conversation state (contacts, pagination) */
  conversationStates: Ref<Record<FilterKeys, ConversationState>>;

  /** Currently active conversation ID */
  activeConversationId: Ref<number | null>;

  /** Whether the profile panel is open */
  isProfileOpen: Ref<boolean>;

  /** Messages keyed by conversation ID */
  messagesMap: Ref<Record<number, Message[]>>;

  /** Number of chats to display per page (computed from screen height) */
  chatsPerPage: ComputedRef<number>;

  /** Total unread message count across all conversations */
  unreadCount: ComputedRef<number>;

  /** Fetch conversations for a given filter, page, and optional search query */
  fetchConversations(filter: FilterKeys, page?: number, search?: string): Promise<void>;

  /** Load the next page of conversations for a given filter */
  loadNextPage(filter: FilterKeys): Promise<void>;

  /** Get the sorted list of contacts for a given filter */
  getDisplayedContacts(filter: FilterKeys): Contact[];

  /** Find a contact by ID across all filters */
  getContactById(id: number): Contact | null;

  /** Mark a conversation as read */
  markAsRead(conversationId: number): void;

  /** Set the active conversation (also marks it as read) */
  setActiveConversation(conversationId: number | null): void;

  /** Open the profile panel */
  openProfile(): void;

  /** Close the profile panel */
  closeProfile(): void;

  /** Update the last message of a conversation (e.g., after sending) */
  updateLastMessage(conversationId: number, message: Message): void;

  /** Patch specific properties of the last message (e.g., for edits, ID swaps) */
  patchLastMessage(conversationId: number, messageId: number, updates: Partial<Message>): void;

  // ─── Profile Store Data ─────────────────────────────────────────────
  /** Current user's profile data */
  userData: Ref<Profile>;

  /** The user's currently chosen role */
  chosenRole: Ref<UserRoleKey>;

  // ─── Chat Action Store Data ─────────────────────────────────────────
  /** Send one or more messages */
  sendMessage(messages: Message[]): Promise<void>;

  /** Delete messages by IDs */
  deleteMessages(ids: number[]): Promise<void>;

  /** Save an edited message */
  saveEditMessage(id: number, text: string): Promise<void>;

  /** Upload progress tracking */
  uploadProgress: Ref<Map<number, { progress: number; uploaded: number; total: number }>>;

  /** Send a service request message */
  sendServiceRequest(
    conversationId: number,
    serviceId: number,
    serviceLabel: string,
    selectedProviders: Provider[],
  ): void;

  /** Send a personal info request message */
  sendPersonalInfoRequest(conversationId: number): void;

  /** Handle access response (approve/reject) */
  handleAccessResponse(
    messageId: number,
    conversationId: number,
    key: 'confirm-access' | 'reject-access',
    currentRequest: any,
  ): Promise<void>;

  // ─── Call Store Data ────────────────────────────────────────────────
  /** Whether a call is currently active */
  isCallActive: ComputedRef<boolean> | Ref<boolean>;

  /** Whether the call is in Picture-in-Picture mode */
  isCallPiP: ComputedRef<boolean> | Ref<boolean>;

  // ─── Service Store Data ─────────────────────────────────────────────
  /** Available services list */
  services: Ref<Service[]>;

  /** Available providers list */
  providers: Ref<Provider[]>;

  /** Fetch the list of services */
  fetchServices(): Promise<void>;

  /** Fetch providers for a given service */
  fetchProviders(isLoadMore?: boolean, serviceId?: number, searchString?: string): Promise<void>;

  // ─── Messages Fetching ──────────────────────────────────────────────
  /** Fetch messages for a conversation (paginated) */
  fetchMessages(conversationId: number, page: number): Promise<Message[]>;
}

/**
 * Represents the state of a conversation list for a specific filter.
 */
export interface ConversationState {
  data: Contact[];
  loading: boolean;
  page: number;
  hasNextPage: boolean;
}
