import type { ChatDataAdapter } from "./types";
import type {
  ChatContact,
  ChatMessage,
  PaginatedResult,
  SendMessagePayload,
  FilterKeys,
} from "../types";

/**
 * A mock implementation of ChatDataAdapter for development and testing.
 */
export class MockChatAdapter implements ChatDataAdapter {
  private currentUserId: number | string;
  private contacts: ChatContact[] = [];

  constructor(currentUserId: number | string = 99) {
    this.currentUserId = currentUserId;
    this.contacts = this.generateMockContacts();
  }

  private generateMockContacts(): ChatContact[] {
    const now = new Date();
    const contacts: ChatContact[] = [];

    const names = [
      ["امیر", "سعیدی"],
      ["سارا", "احمدی"],
      ["علی", "محمدی"],
      ["مریم", "حسینی"],
      ["رضا", "کریمی"],
    ];

    for (let i = 0; i < 30; i++) {
      const [name, lastName] = names[i % names.length];
      const messageDate = new Date(
        now.getTime() - Math.floor(Math.random() * 10000) * 60000,
      );

      contacts.push({
        id: i + 1,
        name: `${name} ${i + 1}`,
        lastName: lastName!,
        isOnline: Math.random() > 0.5,
        lastSeen: new Date(now.getTime() - Math.random() * 3600000),
        imageUrl: `https://i.pravatar.cc/150?u=${i + 1}`,
        isActive: Math.random() > 0.3,
        birthDate: new Date(
          now.getFullYear() - Math.floor(Math.random() * 30 + 20),
          Math.floor(Math.random() * 12),
          Math.floor(Math.random() * 28) + 1,
        ),
        unreadCount: Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 0,
        serviceType: "chat",
        lastMessage: {
          id: 10000 + i,
          conversationId: i + 1,
          date: messageDate,
          type: "text",
          text: "سلام، وقت بخیر؟",
          senderId: Math.random() > 0.5 ? this.currentUserId : i + 1,
          isEdited: false,
          isSent: true,
          isRead: Math.random() > 0.5,
        },
      });
    }

    return contacts;
  }

  async fetchContacts(params: {
    filter: FilterKeys;
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<PaginatedResult<ChatContact>> {
    await new Promise((r) => setTimeout(r, params.page === 1 ? 500 : 200));

    let filtered = [...this.contacts];

    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.lastName.toLowerCase().includes(q),
      );
    }

    if (params.filter === "online") filtered = filtered.filter((c) => c.isOnline);
    if (params.filter === "active") filtered = filtered.filter((c) => c.isActive);
    if (params.filter === "ended") filtered = filtered.filter((c) => !c.isActive);

    const start = (params.page - 1) * params.pageSize;
    const data = filtered.slice(start, start + params.pageSize);

    return {
      data,
      hasNextPage: start + params.pageSize < filtered.length,
      total: filtered.length,
    };
  }

  async fetchMessages(params: {
    conversationId: number | string;
    page: number;
    pageSize: number;
  }): Promise<PaginatedResult<ChatMessage>> {
    await new Promise((r) => setTimeout(r, 300));

    const messages: ChatMessage[] = [];
    const total = 50;
    const start = (params.page - 1) * params.pageSize;
    const end = Math.min(start + params.pageSize, total);
    const now = new Date();

    for (let i = start; i < end; i++) {
      messages.push({
        id: i + 1,
        conversationId: params.conversationId,
        date: new Date(now.getTime() - (total - i) * 60000 * 5),
        type: "text",
        text: `پیام شماره ${i + 1}`,
        senderId:
          Math.random() > 0.5
            ? this.currentUserId
            : params.conversationId,
        isEdited: false,
        isSent: true,
        isRead: true,
      });
    }

    return {
      data: messages,
      hasNextPage: end < total,
      total,
    };
  }

  async sendMessage(payload: SendMessagePayload): Promise<ChatMessage> {
    await new Promise((r) => setTimeout(r, 200));

    return {
      id: Date.now(),
      conversationId: payload.conversationId,
      date: new Date(),
      type: payload.type,
      text: payload.text,
      senderId: this.currentUserId,
      isEdited: false,
      isSent: true,
      isRead: false,
      repliedTo: payload.repliedTo,
    };
  }

  async editMessage(params: {
    messageId: number | string;
    text: string;
  }): Promise<ChatMessage> {
    await new Promise((r) => setTimeout(r, 200));

    return {
      id: params.messageId,
      conversationId: 0,
      date: new Date(),
      type: "text",
      text: params.text,
      senderId: this.currentUserId,
      isEdited: true,
      isSent: true,
      isRead: true,
    };
  }

  async deleteMessages(_messageIds: (number | string)[]): Promise<void> {
    await new Promise((r) => setTimeout(r, 200));
  }

  async markAsRead(_conversationId: number | string): Promise<void> {
    await new Promise((r) => setTimeout(r, 100));
  }

  getCurrentUser() {
    return {
      id: this.currentUserId,
      name: "کاربر فعلی",
      imageUrl: `https://i.pravatar.cc/150?u=${this.currentUserId}`,
    };
  }
}
