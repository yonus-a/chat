import type { Message } from "~/types/chat";
import { injectAppStores } from "~/nuxt-shims";

export interface ChatPushPort {
  appendMessage(message: Message): void;
  markMessageDeleted(conversationId: string, id: string): void;
  setMessageEdited(conversationId: string, id: string, text: string): void;
  setTyping(conversationId: string, name: string | null): void;
  updateLastMessage(conversationId: string, message: Message): void;
}

export function useChatPushPort(): ChatPushPort {
  const chat = injectAppStores().useChatStore();

  return {
    appendMessage(message) {
      const list = chat.messagesMap[message.conversationId] ?? [];
      // dedupe by id
      if (!list.some((m) => m.id === message.id)) {
        chat.messagesMap[message.conversationId] = [...list, message];
      }
      chat.updateLastMessage(message.conversationId, message);
    },
    markMessageDeleted(conversationId, id) {
      const list = chat.messagesMap[conversationId] ?? [];
      chat.messagesMap[conversationId] = list.filter((m) => m.id !== id);
    },
    setMessageEdited(conversationId, id, text) {
      const list = chat.messagesMap[conversationId] ?? [];
      chat.messagesMap[conversationId] = list.map((m) =>
        m.id === id ? { ...m, text, isEdited: true } : m,
      );
      chat.patchLastMessage(conversationId, id, { text, isEdited: true });
    },
    setTyping(conversationId, name) {
      const current = chat.typingByConversation ?? {};
      chat.typingByConversation = { ...current, [conversationId]: name };
    },
    updateLastMessage(conversationId, message) {
      chat.updateLastMessage(conversationId, message);
    },
  };
}
