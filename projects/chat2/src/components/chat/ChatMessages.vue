<template>
  <div class="chat-messages" ref="containerRef">
    <div v-if="isLoading" class="chat-messages__loading">
      <span class="chat-messages__spinner"></span>
    </div>

    <div class="chat-messages__list">
      <ChatBubble
        v-for="msg in enrichedMessages"
        :key="msg.id"
        :message="msg"
        :current-user-id="currentUserId"
        :select-mode="actionStore.isSelectMode"
        :is-selected="actionStore.selectedMessages.has(msg.id)"
        :show-avatar="shouldShowAvatar(msg)"
        :show-options="true"
        :upload-progress="getUploadProgress(msg.id)"
        :is-approving="actionStore.isActionBusy(msg.id, 'confirm-access')"
        :is-rejecting="actionStore.isActionBusy(msg.id, 'reject-access')"
        @approve-request="handleApprove(msg)"
        @reject-request="handleReject(msg)"
      />
    </div>

    <div v-if="messages.length === 0 && !isLoading" class="chat-messages__empty">
      <NoDataDisplay :text="t('noMessages')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import type { Message, ExtendedMessage } from "../../types";
import { useChatActionStore } from "../../stores/chatActionStore";
import { useDate } from "../../composables/useDate";
import { t } from "../../i18n";
import ChatBubble from "./ChatBubble.vue";
import NoDataDisplay from "../general/NoDataDisplay.vue";

const props = defineProps<{
  messages: Message[];
  currentUserId: number;
  contactName?: string;
  contactImage?: string;
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  loadMore: [];
}>();

const actionStore = useChatActionStore();
const { isSameDay } = useDate();
const containerRef = ref<HTMLElement | null>(null);

// Local messages that include ones from event bus
const localMessages = ref<Message[]>([]);

// Subscribe to event buses
let unsubSend: (() => void) | null = null;
let unsubDelete: (() => void) | null = null;
let unsubUpdate: (() => void) | null = null;

onMounted(() => {
  unsubSend = actionStore.sendBus.on((newMsgs) => {
    localMessages.value = [...localMessages.value, ...newMsgs];
  });

  unsubDelete = actionStore.deleteBus.on((ids) => {
    localMessages.value = localMessages.value.filter((m) => !ids.includes(m.id));
  });

  unsubUpdate = actionStore.updateBus.on(({ id, updates }) => {
    localMessages.value = localMessages.value.map((m) => {
      if (m.id === id) return { ...m, ...updates };
      return m;
    });
  });
});

onUnmounted(() => {
  unsubSend?.();
  unsubDelete?.();
  unsubUpdate?.();
});

// Merge prop messages with local messages
watch(
  () => props.messages,
  (newMessages) => {
    localMessages.value = [...newMessages];
  },
  { immediate: true },
);

// Enrich messages with prev/next references and date grouping
const enrichedMessages = computed<ExtendedMessage[]>(() => {
  return localMessages.value.map((msg, idx) => {
    const prev = localMessages.value[idx - 1];
    const next = localMessages.value[idx + 1];
    const isFirstInDate = !prev || !isSameDay(msg.date, prev.date);

    return {
      ...msg,
      prevMessage: prev,
      nextMessage: next,
      isFirstInDate,
      contact: {
        id: msg.senderId,
        name: msg.senderId === props.currentUserId ? "" : (props.contactName || ""),
        lastName: "",
        imageUrl: msg.senderId === props.currentUserId ? "" : (props.contactImage || ""),
        isOnline: false,
        lastSeen: new Date(),
        isActive: true,
        birthDate: new Date(),
      },
    };
  });
});

function shouldShowAvatar(msg: ExtendedMessage): boolean {
  if (msg.senderId === props.currentUserId) return false;
  if (!msg.prevMessage) return true;
  return msg.prevMessage.senderId !== msg.senderId || msg.isFirstInDate;
}

function getUploadProgress(messageId: number): number | undefined {
  const p = actionStore.uploadProgress.get(messageId);
  return p?.progress;
}

function handleApprove(msg: ExtendedMessage) {
  if (msg.request) {
    actionStore.handleAccessResponse(
      msg.id,
      msg.conversationId,
      "confirm-access",
      msg.request,
    );
  }
}

function handleReject(msg: ExtendedMessage) {
  if (msg.request) {
    actionStore.handleAccessResponse(
      msg.id,
      msg.conversationId,
      "reject-access",
      msg.request,
    );
  }
}
</script>

<style scoped>
.chat-messages {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  background: var(--chat-bg-secondary);
}

.chat-messages__loading {
  display: flex;
  justify-content: center;
  padding: var(--chat-spacing-lg);
}

.chat-messages__spinner {
  width: 28px;
  height: 28px;
  border: 2px solid var(--chat-border);
  border-top-color: var(--chat-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.chat-messages__list {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--chat-spacing-md) 0;
}

.chat-messages__empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
