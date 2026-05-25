<template>
  <div class="chat-input">
    <!-- Reply/Edit preview bar -->
    <div v-if="replyingTo || editingMessage" class="chat-input__preview">
      <div class="chat-input__preview-content">
        <span class="chat-input__preview-label">
          {{ editingMessage ? t("editing") : t("replyingTo") }}
        </span>
        <span class="chat-input__preview-text">
          {{ previewText }}
        </span>
      </div>
      <button class="chat-input__preview-close" @click="clearPreview">
        <BIcon name="x" :size="16" />
      </button>
    </div>

    <div class="chat-input__main">
      <!-- Emoji picker trigger -->
      <button class="chat-input__action" @click="showEmojiPicker = !showEmojiPicker">
        <BIcon name="smiley" :size="22" />
      </button>

      <!-- Attachment trigger -->
      <button class="chat-input__action" @click="$emit('openAttachment')">
        <BIcon name="paperclip" :size="22" />
      </button>

      <!-- Text input -->
      <div
        ref="inputRef"
        class="chat-input__field"
        contenteditable="true"
        :data-placeholder="t('typeMessage')"
        @input="onInput"
        @keydown.enter.exact="onEnter"
      ></div>

      <!-- Send / Record button -->
      <button
        v-if="hasText"
        class="chat-input__send"
        @click="send"
      >
        <BIcon name="paper-plane-tilt" :size="22" weight="fill" />
      </button>
      <button
        v-else
        class="chat-input__action chat-input__record"
        @pointerdown="$emit('startRecording', $event)"
        @pointermove="$emit('moveRecording', $event)"
        @pointerup="$emit('stopRecording')"
      >
        <BIcon name="microphone" :size="22" />
      </button>
    </div>

    <!-- Emoji picker -->
    <BEmojiPicker
      :visible="showEmojiPicker"
      @select="insertEmoji"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { Message } from "../../types";
import { useChatActionStore } from "../../stores/chatActionStore";
import { t } from "../../i18n";
import BIcon from "../global/BIcon.vue";
import BEmojiPicker from "../global/BEmojiPicker.vue";

const props = defineProps<{
  conversationId: number;
  currentUserId: number;
}>();

const emit = defineEmits<{
  openAttachment: [];
  startRecording: [event: PointerEvent];
  moveRecording: [event: PointerEvent];
  stopRecording: [];
}>();

const actionStore = useChatActionStore();

const inputRef = ref<HTMLElement | null>(null);
const text = ref("");
const showEmojiPicker = ref(false);

const hasText = computed(() => text.value.trim().length > 0);

const replyingTo = computed(() => actionStore.replyingTo);
const editingMessage = computed(() => actionStore.editingMessage);

const previewText = computed(() => {
  const msg = editingMessage.value || replyingTo.value;
  if (!msg) return "";
  return msg.text?.slice(0, 60) || "[Attachment]";
});

function onInput() {
  text.value = inputRef.value?.textContent || "";
}

function onEnter(e: KeyboardEvent) {
  e.preventDefault();
  send();
}

function send() {
  const content = text.value.trim();
  if (!content) return;

  if (editingMessage.value) {
    actionStore.saveEditMessage(editingMessage.value.id, content);
  } else {
    const newMessage: Message = {
      id: 0,
      conversationId: props.conversationId,
      date: new Date(),
      type: "text",
      text: content,
      senderId: props.currentUserId,
      isSent: false,
      isRead: false,
      isEdited: false,
      repliedTo: replyingTo.value || null,
    };
    actionStore.sendMessage([newMessage]);
  }

  clearInput();
}

function clearInput() {
  text.value = "";
  if (inputRef.value) inputRef.value.textContent = "";
  actionStore.clearActions();
  showEmojiPicker.value = false;
}

function clearPreview() {
  actionStore.replyingTo = null;
  actionStore.editingMessage = null;
}

function insertEmoji(emoji: string) {
  if (inputRef.value) {
    inputRef.value.textContent = (inputRef.value.textContent || "") + emoji;
    text.value = inputRef.value.textContent;
  }
}
</script>

<style scoped>
.chat-input {
  border-top: 1px solid var(--chat-border);
  background: var(--chat-bg);
  position: relative;
}

.chat-input__preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--chat-spacing-sm) var(--chat-spacing-md);
  background: var(--chat-bg-tertiary);
  border-bottom: 1px solid var(--chat-border);
}

.chat-input__preview-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.chat-input__preview-label {
  font-size: var(--chat-font-size-xs);
  color: var(--chat-primary);
  font-weight: 500;
}

.chat-input__preview-text {
  font-size: var(--chat-font-size-sm);
  color: var(--chat-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
}

.chat-input__preview-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--chat-text-secondary);
  padding: 4px;
}

.chat-input__main {
  display: flex;
  align-items: flex-end;
  gap: var(--chat-spacing-xs);
  padding: var(--chat-spacing-sm) var(--chat-spacing-md);
}

.chat-input__action {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--chat-text-secondary);
  padding: var(--chat-spacing-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--chat-radius-full);
  transition: all var(--chat-transition-fast);
}

.chat-input__action:hover {
  color: var(--chat-text);
  background: var(--chat-surface-hover);
}

.chat-input__field {
  flex: 1;
  min-height: 36px;
  max-height: var(--chat-input-max-height);
  overflow-y: auto;
  padding: var(--chat-spacing-sm) var(--chat-spacing-md);
  background: var(--chat-bg-tertiary);
  border-radius: var(--chat-radius-lg);
  font-family: var(--chat-font-family);
  font-size: var(--chat-font-size-md);
  color: var(--chat-text);
  outline: none;
  word-break: break-word;
  line-height: 1.5;
}

.chat-input__field:empty::before {
  content: attr(data-placeholder);
  color: var(--chat-text-tertiary);
  pointer-events: none;
}

.chat-input__send {
  background: var(--chat-primary);
  border: none;
  cursor: pointer;
  color: var(--chat-text-inverse);
  width: 36px;
  height: 36px;
  border-radius: var(--chat-radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--chat-transition-fast);
  flex-shrink: 0;
}

.chat-input__send:hover {
  background: var(--chat-primary-dark);
}

.chat-input__record {
  touch-action: none;
}
</style>
