import type { Contact, Message, FilterKeys } from "~/types/chat";

export interface FetchContactsParams {
  filter: FilterKeys;
  page: number;
  pageSize: number;
  search?: string;
}

export interface ContactsPage {
  data: Contact[];
  hasNextPage: boolean;
}

export interface FetchMessagesParams {
  conversationId: number;
  page: number;
  pageSize: number;
}

export interface ChatAdapter {
  fetchContacts(params: FetchContactsParams): Promise<ContactsPage>;

  fetchMessages(params: FetchMessagesParams): Promise<Message[]>;

  markRead(conversationId: number): Promise<void>;
}
