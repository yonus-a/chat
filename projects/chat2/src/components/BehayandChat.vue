<template>
  <div class="behayand-chat" :class="{ 'behayand-chat--has-active': !!activeChatId }" :dir="dir">
    <div class="behayand-chat__sidebar" :class="{ 'behayand-chat--hidden-mobile': !!activeChatId }">
      <ChatList
        :active-chat-id="activeChatId"
        @select-chat="onSelectChat"
      />
    </div>

    <div class="behayand-chat__content" :class="{ 'behayand-chat--hidden-mobile': !activeChatId }">
      <ChatView
        v-if="activeChatId"
        :chat-id="activeChatId"
        :current-user-id="currentUserId"
        :messages="currentMessages"
        :show-back="isMobile"
        @back="activeChatId = null"
        @call="$emit('call', { chatId: activeChatId, type: $event })"
      />
      <div v-else class="behayand-chat__empty">
        <NoDataDisplay :text="t('selectChat')" />
      </div>
    </div>

    <BToast />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, provide, onMounted } from "vue";
import type { Message } from "../types";
import type { ChatDataAdapter } from "../adapter/types";
import { CHAT_ADAPTER_KEY } from "../adapter/useChatAdapter";
import { useChatStore } from "../stores/chatStore";
import { useChatActionStore } from "../stores/chatActionStore";
import { useWindowSize } from "../composables/useWindowSize";
import { setChatLocale, registerChatLocale, t } from "../i18n";
import type { ChatLocaleMessages } from "../i18n";
import ChatList from "./chat/contact/ChatList.vue";
import ChatView from "./chat/ChatView.vue";
import NoDataDisplay from "./general/NoDataDisplay.vue";
import BToast from "./global/BToast.vue";

const props = withDefaults(
  defineProps<{
    adapter: ChatDataAdapter;
    locale?: string;
    localeMessages?: Record<string, ChatLocaleMessages>;
    dir?: "ltr" | "rtl";
    initialChatId?: number | null;
  }>(),
  {
    locale: "fa",
    dir: "rtl",
    initialChatId: null,
  },
);

const emit = defineEmits<{
  "chat-selected": [id: number | null];
  call: [data: { chatId: number; type: "voice" | "video" }];
}>();

provide(CHAT_ADAPTER_KEY, props.adapter);

const chatStore = useChatStore();
const actionStore = useChatActionStore();

onMounted(() => {
  chatStore.setAdapter(props.adapter);
  actionStore.setAdapter(props.adapter);

  if (props.locale) setChatLocale(props.locale);
  if (props.localeMessages) {
    for (const [key, messages] of Object.entries(props.localeMessages)) {
      registerChatLocale(key, messages);
    }
  }
});

const { width } = useWindowSize();
const isMobile = computed(() => width.value < 768);

const activeChatId = ref<number | null>(props.initialChatId);
const currentMessages = ref<Message[]>([]);
const currentUserId = computed(() => props.adapter.getCurrentUserId());

function onSelectChat(id: number) {
  activeChatId.value = id;
  emit("chat-selected", id);
  loadMessages(id);
}

async function loadMessages(chatId: number) {
  try {
    const result = await props.adapter.fetchMessages({
      conversationId: chatId,
      page: 1,
      pageSize: 30,
    });
    currentMessages.value = result.data;
  } catch (err) {
    console.error("[@behayand/chat] Failed to load messages:", err);
  }
}
</script>

<style scoped>
.behayand-chat {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--chat-bg);
  font-family: var(--chat-font-family);
  color: var(--chat-text);
  border-radius: var(--chat-radius-lg);
  border: 1px solid var(--chat-border);
}

.behayand-chat__sidebar {
  flex-shrink: 0;
}

.behayand-chat__content {
  flex: 1;
  min-width: 0;
  display: flex;
}

.behayand-chat__empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .behayand-chat--hidden-mobile {
    display: none !important;
  }

  .behayand-chat__sidebar {
    width: 100%;
  }
}
</style>
