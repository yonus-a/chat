<template>
  <div class="behayand-chat" :class="[dirClass]">
    <div class="bc-root bg-surface w-full h-full overflow-hidden flex">
      <div class="flex-1 h-full max-h-full flex flex-col min-w-0">
        <div class="flex-1 w-full overflow-y-auto">
          <div class="flex w-full h-full max-h-full overflow-hidden">
            <!-- Messaging section -->
            <div
              v-if="showMessagingSection"
              class="h-full flex-1 relative bg-surface-variant"
            >
              <div class="h-full w-full flex">
                <div
                  v-show="chatId"
                  class="flex flex-1 flex-col justify-between items-center h-full"
                >
                  <div class="w-full bg-surface h-16 md:h-20">
                    <slot name="page-bar" :contact="selectedContact" :conversation-id="chatId">
                      <div class="h-full flex items-center px-4">
                        <span class="text-on-surface">{{ selectedContact?.name }} {{ selectedContact?.lastName }}</span>
                      </div>
                    </slot>
                  </div>

                  <div class="flex-1 w-full min-h-0 overflow-hidden">
                    <slot name="messages" :contact="selectedContact" :conversation-id="chatId" :messages="messages">
                      <div class="h-full w-full overflow-y-auto p-4">
                        <div v-for="msg in messages" :key="msg.id" class="mb-2">
                          <div
                            :class="[
                              msg.senderId === config.currentUserId ? 'ml-auto bg-primary-100' : 'mr-auto bg-surface',
                              'max-w-[70%] rounded-lg p-2'
                            ]"
                          >
                            <p class="text-on-surface text-sm">{{ msg.text }}</p>
                          </div>
                        </div>
                      </div>
                    </slot>
                  </div>

                  <div class="w-full">
                    <slot name="input" :conversation-id="chatId" :on-send="handleSendMessage">
                      <div class="p-3 border-t border-outline-variant bg-surface">
                        <div class="flex gap-2">
                          <input
                            v-model="inputText"
                            type="text"
                            class="flex-1 rounded-lg border border-outline-variant px-3 py-2 text-sm outline-none"
                            placeholder="Type a message..."
                            @keyup.enter="handleSendMessage({ type: 'text', text: inputText, conversationId: chatId! })"
                          />
                          <button
                            class="rounded-lg bg-primary-500 px-4 py-2 text-white text-sm"
                            @click="handleSendMessage({ type: 'text', text: inputText, conversationId: chatId! })"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    </slot>
                  </div>
                </div>

                <div
                  v-show="!chatId"
                  class="w-full h-full flex items-center justify-center"
                >
                  <slot name="empty-state">
                    <p class="text-on-surface/50">Select a conversation</p>
                  </slot>
                </div>
              </div>
            </div>

            <!-- Contact list sidebar -->
            <div
              v-if="showContactList"
              class="md:w-80 w-full h-full shrink-0 border-l border-outline-variant"
            >
              <slot name="contact-list" :contacts="contacts" :on-select="selectConversation">
                <div class="h-full overflow-y-auto">
                  <div
                    v-for="contact in contacts"
                    :key="contact.id"
                    class="flex items-center gap-3 p-3 cursor-pointer hover:bg-surface-variant/50 border-b border-outline-variant"
                    :class="[chatId === contact.id ? 'bg-surface-variant' : '']"
                    @click="selectConversation(contact.id)"
                  >
                    <img
                      :src="contact.imageUrl"
                      :alt="contact.name"
                      class="w-10 h-10 rounded-full object-cover"
                    />
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-on-surface truncate">
                        {{ contact.name }} {{ contact.lastName }}
                      </p>
                      <p class="text-xs text-on-surface/60 truncate">
                        {{ contact.lastMessage?.text }}
                      </p>
                    </div>
                    <div v-if="contact.unreadCount" class="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                      <span class="text-white text-xs">{{ contact.unreadCount }}</span>
                    </div>
                  </div>
                </div>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
} from "vue";
import type { ChatDataAdapter } from "./adapter/types";
import type { ChatConfig, ChatContact, ChatMessage, FilterKeys, SendMessagePayload } from "./types";
import { useChatAdapter, provideChatAdapter } from "./adapter/useChatAdapter";

export default defineComponent({
  name: "BehayandChat",
  props: {
    /**
     * The data adapter. If provided as a prop, it will be used directly.
     * Otherwise, the component will try to inject one from a parent provider.
     */
    adapter: {
      type: Object as PropType<ChatDataAdapter>,
      default: undefined,
    },
    /**
     * Chat configuration options.
     */
    config: {
      type: Object as PropType<ChatConfig>,
      required: true,
    },
  },
  emits: ["conversation-selected", "message-sent", "error"],
  setup(props, { emit }) {
    // Provide adapter if passed as prop
    if (props.adapter) {
      provideChatAdapter(props.adapter);
    }

    const adapter = props.adapter ? props.adapter : useChatAdapter();

    // State
    const contacts = ref<ChatContact[]>([]);
    const messages = ref<ChatMessage[]>([]);
    const chatId = ref<number | string | null>(null);
    const inputText = ref("");
    const isLoading = ref(false);
    const windowWidth = ref(typeof window !== "undefined" ? window.innerWidth : 1024);

    const isMobile = computed(() => windowWidth.value < 768);
    const dirClass = computed(() => props.config.direction === "rtl" ? "bc-rtl" : "bc-ltr");
    const onResize = () => {
      windowWidth.value = window.innerWidth;
    };

    const selectedContact = computed(() => {
      if (!chatId.value) return null;
      return contacts.value.find((c) => c.id === chatId.value) || null;
    });

    const showContactList = computed(() => {
      if (isMobile.value) return !chatId.value;
      return true;
    });

    const showMessagingSection = computed(() => {
      if (isMobile.value) return !!chatId.value;
      return true;
    });

    // Actions
    const fetchContacts = async (filter: FilterKeys = "", page = 1, search = "") => {
      isLoading.value = true;
      try {
        const result = await adapter.fetchContacts({
          filter,
          page,
          pageSize: 20,
          search,
        });
        if (page === 1) {
          contacts.value = result.data;
        } else {
          contacts.value = [...contacts.value, ...result.data];
        }
      } catch (err) {
        emit("error", err);
      } finally {
        isLoading.value = false;
      }
    };

    const fetchMessages = async (conversationId: number | string, page = 1) => {
      try {
        const result = await adapter.fetchMessages({
          conversationId,
          page,
          pageSize: 30,
        });
        if (page === 1) {
          messages.value = result.data;
        } else {
          messages.value = [...result.data, ...messages.value];
        }
      } catch (err) {
        emit("error", err);
      }
    };

    const selectConversation = (id: number | string) => {
      chatId.value = id;
      emit("conversation-selected", id);
      adapter.markAsRead(id);
    };

    const handleSendMessage = async (payload: SendMessagePayload) => {
      if (!payload.text?.trim() && !payload.file) return;
      try {
        const msg = await adapter.sendMessage(payload);
        messages.value.push(msg);
        inputText.value = "";
        emit("message-sent", msg);
      } catch (err) {
        emit("error", err);
      }
    };

    // Lifecycle
    onMounted(() => {
      fetchContacts();
      if (typeof window !== "undefined") {
        window.addEventListener("resize", onResize);
      }
    });

    onBeforeUnmount(() => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", onResize);
      }
    });

    watch(
      () => chatId.value,
      (newId) => {
        if (newId) {
          fetchMessages(newId);
        }
      },
    );

    return {
      contacts,
      messages,
      chatId,
      inputText,
      selectedContact,
      showContactList,
      showMessagingSection,
      dirClass,
      selectConversation,
      handleSendMessage,
    };
  },
});
</script>

<style>
.behayand-chat {
  --bc-primary: #26a99c;
  --bc-surface: #ffffff;
  --bc-surface-variant: #f5f5f5;
  --bc-on-surface: #1a1a1a;
  --bc-outline-variant: #e0e0e0;
}

.behayand-chat .bg-surface {
  background-color: var(--bc-surface);
}

.behayand-chat .bg-surface-variant {
  background-color: var(--bc-surface-variant);
}

.behayand-chat .text-on-surface {
  color: var(--bc-on-surface);
}

.behayand-chat .border-outline-variant {
  border-color: var(--bc-outline-variant);
}

.behayand-chat .bg-primary-100 {
  background-color: #d4f9f5;
}

.behayand-chat .bg-primary-500 {
  background-color: var(--bc-primary);
}

.bc-rtl {
  direction: rtl;
}

.bc-ltr {
  direction: ltr;
}
</style>
