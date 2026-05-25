import type { ChatDataAdapter } from "./types";
import type { Contact, Message, FilterKeys } from "../types";

/**
 * Mock adapter for development and demo purposes.
 * Uses the same mock data generation logic from the original Nuxt app.
 */
export function createMockAdapter(userId: number = 99): ChatDataAdapter {
  const now = new Date();

  function getRandomBirthDate(): Date {
    const yearsAgo = Math.floor(Math.random() * (50 - 18 + 1)) + 18;
    const date = new Date();
    date.setFullYear(now.getFullYear() - yearsAgo);
    date.setMonth(Math.floor(Math.random() * 12));
    date.setDate(Math.floor(Math.random() * 28) + 1);
    return date;
  }

  function generateContacts(
    filter: FilterKeys,
    page: number,
    pageSize: number,
    search: string = "",
  ): { data: Contact[]; hasNextPage: boolean } {
    const basePool: Contact[] = [
      {
        id: 1,
        name: "امیر",
        lastName: "سعیدی",
        isOnline: true,
        lastSeen: now,
        imageUrl: "https://i.pravatar.cc/150?u=1",
        isActive: false,
        unreadCount: 2,
        serviceType: "chat",
        birthDate: getRandomBirthDate(),
        phoneNumber: "09134168227",
        nationalCode: "1235678901",
        lastMessage: {
          id: 101,
          conversationId: 1,
          date: new Date(now.getTime() - 1000 * 60 * 5),
          type: "text",
          text: "سلام، وقت بخیر؟",
          senderId: 1,
          isEdited: false,
          isSent: true,
          isRead: false,
          repliedTo: null,
        },
      },
      {
        id: 2,
        name: "سارا",
        lastName: "احمدی",
        isOnline: false,
        lastSeen: new Date(now.getTime() - 3600000),
        imageUrl: "https://i.pravatar.cc/150?u=2",
        isActive: true,
        unreadCount: 0,
        serviceType: "voice-call",
        birthDate: getRandomBirthDate(),
        phoneNumber: "09134168227",
        nationalCode: "1235678901",
        lastMessage: {
          id: 102,
          conversationId: 2,
          date: new Date(now.getTime() - 1000 * 3600 * 2),
          type: "text",
          text: "بله، فایل رو بررسی کردم.",
          senderId: userId,
          isEdited: false,
          isSent: true,
          isRead: true,
          repliedTo: null,
        },
      },
    ];

    const largePool: Contact[] = [];
    for (let i = 0; i < 70; i++) {
      const template = basePool[i % basePool.length];
      const uniqueId = i + 1;
      const messageDate = new Date(
        now.getTime() - Math.floor(Math.random() * 10000) * 60000,
      );

      largePool.push({
        id: uniqueId,
        name: `${template.name} ${uniqueId}`,
        lastName: template.lastName,
        isOnline: template.isOnline,
        lastSeen: template.lastSeen,
        imageUrl: `https://i.pravatar.cc/150?u=${uniqueId}`,
        isActive: template.isActive,
        unreadCount: template.unreadCount,
        serviceType: template.serviceType,
        phoneNumber: template.phoneNumber,
        nationalCode: template.nationalCode,
        birthDate: getRandomBirthDate(),
        lastMessage: template.lastMessage
          ? {
              id: 10000 + uniqueId,
              conversationId: uniqueId,
              date: messageDate,
              type: template.lastMessage.type,
              text: template.lastMessage.text,
              isEdited: false,
              senderId: template.lastMessage.senderId,
              isSent: true,
              isRead: template.lastMessage.isRead,
              repliedTo: null,
            }
          : undefined,
      });
    }

    let filtered = largePool;
    if (search) {
      const query = search.toLowerCase();
      filtered = largePool.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.lastName.toLowerCase().includes(query),
      );
    }

    if (filter === "online") filtered = filtered.filter((c) => c.isOnline);
    if (filter === "active") filtered = filtered.filter((c) => c.isActive);
    if (filter === "ended") filtered = filtered.filter((c) => !c.isActive);

    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    return {
      data,
      hasNextPage: data.length >= pageSize,
    };
  }

  function generateMessages(
    conversationId: number,
    page: number,
    pageSize: number,
  ): { data: Message[]; hasNextPage: boolean } {
    const messages: Message[] = [];
    const totalMockMessages = 50;
    const start = (page - 1) * pageSize;

    for (let i = start; i < Math.min(start + pageSize, totalMockMessages); i++) {
      const isMine = i % 3 === 0;
      const msgDate = new Date(now.getTime() - (totalMockMessages - i) * 60000 * 5);

      messages.push({
        id: conversationId * 1000 + i,
        conversationId,
        date: msgDate,
        type: "text",
        text: isMine
          ? `پیام ارسالی شماره ${i + 1}`
          : `پیام دریافتی شماره ${i + 1}`,
        senderId: isMine ? userId : conversationId,
        isEdited: false,
        isSent: true,
        isRead: i < totalMockMessages - 3,
        repliedTo: null,
      });
    }

    return {
      data: messages,
      hasNextPage: start + pageSize < totalMockMessages,
    };
  }

  return {
    getCurrentUserId: () => userId,

    async fetchConversations(params) {
      await new Promise((r) => setTimeout(r, params.page === 1 ? 800 : 400));
      return generateContacts(
        params.filter,
        params.page,
        params.pageSize,
        params.search,
      );
    },

    async fetchMessages(params) {
      await new Promise((r) => setTimeout(r, 500));
      return generateMessages(
        params.conversationId,
        params.page,
        params.pageSize,
      );
    },

    async sendMessage(messages) {
      await new Promise((r) => setTimeout(r, 1000));
      return messages.map((m) => ({
        ...m,
        id: Math.floor(Math.random() * 100000) + 1000,
        isSent: true,
      }));
    },

    async deleteMessages(_ids) {
      await new Promise((r) => setTimeout(r, 800));
    },

    async editMessage(messageId, newText) {
      await new Promise((r) => setTimeout(r, 800));
      return {
        id: messageId,
        conversationId: 0,
        date: new Date(),
        type: "text",
        text: newText,
        senderId: userId,
        isEdited: true,
        isSent: true,
        isRead: false,
        repliedTo: null,
      };
    },

    async uploadFile(_file, onProgress) {
      const totalSteps = 10;
      for (let i = 1; i <= totalSteps; i++) {
        await new Promise((r) => setTimeout(r, 250));
        onProgress?.(Math.round((i / totalSteps) * 100));
      }
      return "https://example.com/uploaded-file.pdf";
    },

    async markAsRead(_conversationId) {
      await new Promise((r) => setTimeout(r, 200));
    },

    async handleAccessResponse(_params) {
      await new Promise((r) => setTimeout(r, 1500));
    },

    async sendServiceRequest(_params) {
      await new Promise((r) => setTimeout(r, 1000));
      return {
        id: Math.floor(Math.random() * -1000000),
        conversationId: _params.conversationId,
        date: new Date(),
        type: "text" as const,
        senderId: userId,
        isSent: true,
        isRead: false,
        isEdited: false,
        repliedTo: null,
        request: {
          id: Math.floor(Math.random() * 10000),
          type: "add-person" as const,
          request: {
            id: _params.serviceId,
            label: _params.serviceLabel,
            status: "pending" as const,
            provider: [],
          },
        },
      };
    },

    async sendPersonalInfoRequest(conversationId) {
      await new Promise((r) => setTimeout(r, 1000));
      return {
        id: Math.floor(Math.random() * -1000000),
        conversationId,
        date: new Date(),
        type: "text" as const,
        senderId: userId,
        isSent: true,
        isRead: false,
        isEdited: false,
        repliedTo: null,
        request: {
          id: Math.floor(Math.random() * 10000),
          type: "personal-info" as const,
          request: {
            id: Math.floor(Math.random() * 10000),
            date: new Date(),
            status: "pending" as const,
          },
        },
      };
    },

    async fetchServices() {
      return [
        { id: 1, label: "ویزیت آنلاین" },
        { id: 2, label: "مشاوره تلفنی" },
        { id: 3, label: "نوبت حضوری" },
      ];
    },

    async fetchProviders(_serviceId) {
      return [
        {
          id: 1,
          name: "دکتر",
          lastName: "محمدی",
          imageUrl: "https://i.pravatar.cc/150?u=doc1",
          fellowship: { id: 1, label: "متخصص قلب" },
          price: 350000,
        },
      ];
    },

    async fetchMediaFiles(_params) {
      return {
        data: Array.from({ length: 9 }, (_, i) => `https://picsum.photos/200?random=${i}`),
        hasNextPage: false,
      };
    },
  };
}
