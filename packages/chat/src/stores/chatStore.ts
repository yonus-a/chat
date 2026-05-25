import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Message, Contact, FilterKeys } from "../types";
import { useWindowSize } from "../composables/useWindowSize";
import type { ChatDataAdapter } from "../adapter/types";

export const useChatStore = defineStore("behayand-chat", () => {
  const { height: windowHeight } = useWindowSize();

  // Adapter reference - set via initChatStore
  let adapter: ChatDataAdapter | null = null;

  function setAdapter(a: ChatDataAdapter) {
    adapter = a;
  }

  function getAdapter(): ChatDataAdapter {
    if (!adapter) {
      throw new Error(
        "[@behayand/chat] No adapter set. Call chatStore.setAdapter() first.",
      );
    }
    return adapter;
  }

  // Dynamic calculation based on screen height
  const chatsPerPage = computed(() => {
    const h = windowHeight.value || 800;
    return Math.floor((h - 138) / 76) + 1;
  });

  // --- STATE ---
  const activeConversationId = ref<number | null>(null);
  const messagesMap = ref<Record<number, Message[]>>({});

  const conversationStates = ref<
    Record<
      FilterKeys,
      {
        data: Contact[];
        loading: boolean;
        page: number;
        hasNextPage: boolean;
      }
    >
  >({
    "": { data: [], loading: false, page: 0, hasNextPage: true },
    online: { data: [], loading: false, page: 0, hasNextPage: true },
    ended: { data: [], loading: false, page: 0, hasNextPage: true },
    active: { data: [], loading: false, page: 0, hasNextPage: true },
  });

  // --- ACTIONS ---
  const fetchConversations = async (
    filter: FilterKeys = "",
    page: number = 1,
    search: string = "",
  ) => {
    const state = conversationStates.value[filter];
    if (state.loading) return;

    state.loading = true;
    try {
      const result = await getAdapter().fetchConversations({
        filter,
        page,
        pageSize: chatsPerPage.value,
        search,
      });

      if (page === 1) state.data = result.data;
      else state.data = [...state.data, ...result.data];

      state.page = page;
      state.hasNextPage = result.hasNextPage;
    } finally {
      state.loading = false;
    }
  };

  const loadNextPage = async (filter: FilterKeys) => {
    const state = conversationStates.value[filter];
    if (state.hasNextPage && !state.loading) {
      await fetchConversations(filter, state.page + 1);
    }
  };

  const getDisplayedContacts = (filter: FilterKeys) => {
    const state = conversationStates.value[filter];

    // Show skeletons only if we haven't loaded the first page yet
    if (state.loading && state.page === 0) {
      return Array.from(
        { length: chatsPerPage.value },
        (_, i) =>
          ({
            id: -i - 1,
            name: "...",
            lastName: "...",
            imageUrl: "",
            isOnline: false,
            lastSeen: new Date(),
            isActive: true,
            birthDate: new Date(),
            unreadCount: 0,
            serviceType: "chat",
            lastMessage: {
              id: -1,
              conversationId: -i - 1,
              date: new Date(),
              type: "text",
              text: "...",
              isEdited: false,
              senderId: -1,
              isSent: true,
              isRead: true,
              repliedTo: null,
            },
          }) as Contact,
      );
    }

    // Sort by date descending (newest first)
    return [...state.data].sort((a, b) => {
      const dateA = a.lastMessage ? new Date(a.lastMessage.date).getTime() : 0;
      const dateB = b.lastMessage ? new Date(b.lastMessage.date).getTime() : 0;
      return dateB - dateA;
    });
  };

  const getContactById = (id: number): Contact | null => {
    for (const key in conversationStates.value) {
      const contact = conversationStates.value[key as FilterKeys].data.find(
        (c) => c.id === id,
      );
      if (contact) return contact;
    }
    return null;
  };

  const markAsRead = async (conversationId: number) => {
    // Optimistic update
    for (const key in conversationStates.value) {
      const contact = conversationStates.value[key as FilterKeys].data.find(
        (c) => c.id === conversationId,
      );
      if (contact) {
        contact.unreadCount = 0;
        if (contact.lastMessage) {
          contact.lastMessage.isRead = true;
        }
      }
    }
    // Notify adapter
    await getAdapter().markAsRead(conversationId);
  };

  const updateLastMessage = (conversationId: number, message: Message) => {
    for (const key in conversationStates.value) {
      const state = conversationStates.value[key as FilterKeys];
      const contact = state.data.find((c) => c.id === conversationId);
      if (contact) {
        contact.lastMessage = { ...message };
      }
    }
  };

  const patchLastMessage = (
    conversationId: number,
    messageId: number,
    updates: Partial<Message>,
  ) => {
    for (const key in conversationStates.value) {
      const contact = conversationStates.value[key as FilterKeys].data.find(
        (c) => c.id === conversationId,
      );
      if (
        contact &&
        contact.lastMessage &&
        contact.lastMessage.id === messageId
      ) {
        contact.lastMessage = { ...contact.lastMessage, ...updates };
      }
    }
  };

  const unreadCount = computed(() => {
    const uniqueContacts = new Map<number, Contact>();
    for (const key in conversationStates.value) {
      const state = conversationStates.value[key as FilterKeys];
      state.data.forEach((contact) => {
        if (!uniqueContacts.has(contact.id)) {
          uniqueContacts.set(contact.id, contact);
        }
      });
    }
    return Array.from(uniqueContacts.values()).filter((contact) => {
      return contact.lastMessage && contact.lastMessage.isRead === false;
    }).length;
  });

  return {
    setAdapter,
    conversationStates,
    activeConversationId,
    fetchConversations,
    loadNextPage,
    getDisplayedContacts,
    chatsPerPage,
    unreadCount,
    getContactById,
    messagesMap,
    markAsRead,
    updateLastMessage,
    patchLastMessage,
  };
});
