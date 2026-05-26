import type { ChatDataAdapter } from "./types";
import type {
  Contact,
  CurrentUser,
  FilterKeys,
  Message,
  PaginatedContacts,
  PaginatedMessages,
} from "../types";

/**
 * A mock implementation of ChatDataAdapter for development and testing.
 * Generates fake contacts and messages with simulated network delay.
 */
export class MockChatAdapter implements ChatDataAdapter {
  private currentUser: CurrentUser;

  constructor(user?: Partial<CurrentUser>) {
    this.currentUser = {
      id: user?.id ?? 99,
      name: user?.name ?? "Test",
      lastName: user?.lastName ?? "User",
      imageUrl: user?.imageUrl ?? "https://i.pravatar.cc/150?u=99",
    };
  }

  getCurrentUser(): CurrentUser {
    return this.currentUser;
  }

  async fetchConversations(
    filter: FilterKeys,
    page: number,
    pageSize: number,
    search?: string,
  ): Promise<PaginatedContacts> {
    await this.delay(page === 1 ? 800 : 400);

    const contacts: Contact[] = Array.from({ length: pageSize }, (_, i) => {
      const id = (page - 1) * pageSize + i + 1;
      const isOnline = id % 3 === 0;
      const isActive = id % 2 === 0;

      return {
        id,
        name: `Contact ${id}`,
        lastName: `Last ${id}`,
        isOnline,
        lastSeen: new Date(Date.now() - id * 60000),
        imageUrl: `https://i.pravatar.cc/150?u=${id}`,
        isActive,
        unreadCount: id % 5 === 0 ? 2 : 0,
        serviceType: "chat" as const,
        lastMessage: {
          id: 10000 + id,
          conversationId: id,
          date: new Date(Date.now() - id * 120000),
          type: "text" as const,
          text: `Last message from contact ${id}`,
          isEdited: false,
          senderId: id,
          isSent: true,
          isRead: id % 5 !== 0,
        },
      };
    });

    let filtered = contacts;
    if (search) {
      const q = search.toLowerCase();
      filtered = contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.lastName.toLowerCase().includes(q),
      );
    }
    if (filter === "online") filtered = filtered.filter((c) => c.isOnline);
    if (filter === "active") filtered = filtered.filter((c) => c.isActive);
    if (filter === "ended") filtered = filtered.filter((c) => !c.isActive);

    return {
      data: filtered,
      hasNextPage: filtered.length >= pageSize,
    };
  }

  async fetchMessages(
    conversationId: number,
    page: number,
    pageSize: number,
  ): Promise<PaginatedMessages> {
    await this.delay(600);

    const messages: Message[] = Array.from({ length: pageSize }, (_, i) => {
      const globalIndex = (page - 1) * pageSize + i;
      const id = 1000 - globalIndex;
      const isMe = globalIndex % 2 === 0;

      return {
        id,
        conversationId,
        date: new Date(Date.now() - globalIndex * 300000),
        type: "text" as const,
        text: `Message ${id}: ${isMe ? "Sent by me." : "Received."}`,
        isEdited: false,
        senderId: isMe ? this.currentUser.id : conversationId,
        isSent: true,
        isRead: true,
      };
    });

    return {
      data: messages,
      hasNextPage: page < 5,
    };
  }

  async sendMessages(messages: Message[]): Promise<Message[]> {
    await this.delay(500);
    return messages.map((m) => ({
      ...m,
      id: Math.floor(Math.random() * 100000) + 1000,
      isSent: true,
    }));
  }

  async editMessage(messageId: number, newText: string): Promise<Message> {
    await this.delay(500);
    return {
      id: messageId,
      conversationId: 0,
      date: new Date(),
      type: "text",
      text: newText,
      isEdited: true,
      senderId: this.currentUser.id,
      isSent: true,
      isRead: true,
    };
  }

  async deleteMessages(_messageIds: number[]): Promise<void> {
    await this.delay(500);
  }

  async markAsRead(_conversationId: number): Promise<void> {
    await this.delay(100);
  }

  async getContactById(contactId: number): Promise<Contact | null> {
    return {
      id: contactId,
      name: `Contact ${contactId}`,
      lastName: `Last ${contactId}`,
      isOnline: true,
      lastSeen: new Date(),
      imageUrl: `https://i.pravatar.cc/150?u=${contactId}`,
      isActive: true,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
