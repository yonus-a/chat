<template>
  <div class="chat-bubble-wrapper" :class="{ 'chat-bubble-wrapper--mine': isMine }">
    <!-- Date separator -->
    <div v-if="message.isFirstInDate" class="chat-bubble__date-separator">
      <span>{{ formatDateFull(message.date) }}</span>
    </div>

    <div
      class="chat-bubble"
      :class="{
        'chat-bubble--mine': isMine,
        'chat-bubble--other': !isMine,
        'chat-bubble--selected': isSelected,
        'chat-bubble--select-mode': selectMode,
      }"
      @click="onClick"
      @contextmenu.prevent="onContextMenu"
    >
      <!-- Selection checkbox -->
      <div v-if="selectMode" class="chat-bubble__checkbox">
        <input type="checkbox" :checked="isSelected" readonly />
      </div>

      <!-- Avatar for others' messages -->
      <ContactAvatar
        v-if="!isMine && showAvatar"
        :image-url="message.contact?.imageUrl"
        :name="message.contact?.name"
        :last-name="message.contact?.lastName"
        size="sm"
        :show-online="false"
        class="chat-bubble__avatar"
      />

      <div class="chat-bubble__content">
        <!-- Reply preview -->
        <div v-if="message.repliedTo" class="chat-bubble__reply" @click.stop="$emit('scrollToReply', message.repliedTo.id)">
          <span class="chat-bubble__reply-name">{{ replyName }}</span>
          <span class="chat-bubble__reply-text">{{ replyPreview }}</span>
        </div>

        <!-- Content based on type -->
        <ImageGroupDisplay
          v-if="message.type === 'image' && message.imageUrl?.length"
          :images="message.imageUrl"
          @preview="$emit('previewImage', $event)"
        />

        <VoiceDisplay
          v-else-if="message.type === 'voice'"
          :voice-url="message.voiceUrl"
        />

        <BubbleVideo
          v-else-if="message.type === 'video'"
          :video-url="message.videoUrl"
          :progress="uploadProgressValue"
        />

        <FileDisplay
          v-else-if="message.type === 'file'"
          :file-url="message.fileUrl"
          :file-name="message.fileUrl?.split('/').pop()"
          :progress="uploadProgressValue"
        />

        <RequestDisplay
          v-if="message.request"
          :message="message"
          :is-mine="isMine"
          :is-approving="isApproving"
          :is-rejecting="isRejecting"
          @approve="$emit('approveRequest')"
          @reject="$emit('rejectRequest')"
        />

        <!-- Text content -->
        <p v-if="message.text && message.type === 'text'" class="chat-bubble__text">
          <SafeEmojiText :text="message.text" />
        </p>

        <!-- Footer: time + status -->
        <div class="chat-bubble__footer">
          <span v-if="message.isEdited" class="chat-bubble__edited">{{ t("edited") }}</span>
          <span class="chat-bubble__time">{{ formatTime(message.date) }}</span>
          <span v-if="isMine" class="chat-bubble__status">
            <BIcon v-if="!message.isSent" name="clock" :size="12" />
            <BIcon v-else-if="message.isRead" name="checks" :size="14" />
            <BIcon v-else name="check" :size="14" />
          </span>
        </div>
      </div>

      <!-- Bubble options (hover menu) -->
      <BubbleOptions
        v-if="showOptions && !selectMode"
        :visible="isHovered"
        :is-mine="isMine"
        :can-edit="canEditThis"
        :can-delete="canDeleteThis"
        @action="handleAction"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { ExtendedMessage } from "../../types";
import { useDate } from "../../composables/useDate";
import { useChatActionStore } from "../../stores/chatActionStore";
import { t } from "../../i18n";
import BIcon from "../global/BIcon.vue";
import SafeEmojiText from "../general/SafeEmojiText.vue";
import ContactAvatar from "./contact/ContactAvatar.vue";
import BubbleOptions from "./chat-bubbles/BubbleOptions.vue";
import ImageGroupDisplay from "./chat-bubbles/ImageGroupDisplay.vue";
import VoiceDisplay from "./chat-bubbles/VoiceDisplay.vue";
import BubbleVideo from "./chat-bubbles/BubbleVideo.vue";
import FileDisplay from "./chat-bubbles/FileDisplay.vue";
import RequestDisplay from "./chat-bubbles/RequestDisplay.vue";

const props = defineProps<{
  message: ExtendedMessage;
  currentUserId: number;
  selectMode?: boolean;
  isSelected?: boolean;
  showAvatar?: boolean;
  showOptions?: boolean;
  uploadProgress?: number;
  isApproving?: boolean;
  isRejecting?: boolean;
}>();

const emit = defineEmits<{
  scrollToReply: [id: number];
  previewImage: [index: number];
  approveRequest: [];
  rejectRequest: [];
}>();

const actionStore = useChatActionStore();
const { formatDateFull, formatTime } = useDate();

const isHovered = ref(false);

const isMine = computed(() => props.message.senderId === props.currentUserId);

const uploadProgressValue = computed(() => {
  if (props.uploadProgress !== undefined) return props.uploadProgress;
  const p = actionStore.uploadProgress.get(props.message.id);
  return p?.progress;
});

const canEditThis = computed(() => {
  if (!isMine.value) return false;
  const hoursPassed = (Date.now() - new Date(props.message.date).getTime()) / (1000 * 60 * 60);
  return hoursPassed < actionStore.editWindowHours;
});

const canDeleteThis = computed(() => canEditThis.value);

const replyName = computed(() => {
  if (!props.message.repliedTo) return "";
  return props.message.repliedTo.senderId === props.currentUserId
    ? t("you")
    : props.message.contact?.name || "";
});

const replyPreview = computed(() => {
  const reply = props.message.repliedTo;
  if (!reply) return "";
  if (reply.text) return reply.text.slice(0, 50);
  if (reply.type === "image") return "📷";
  if (reply.type === "voice") return "🎤";
  if (reply.type === "video") return "🎥";
  return "📎";
});

function onClick() {
  if (props.selectMode) {
    actionStore.toggleSelection(props.message);
  }
}

function onContextMenu() {
  if (!props.selectMode) {
    actionStore.startSelectMode(props.message);
  }
}

function handleAction(key: string) {
  switch (key) {
    case "reply":
      actionStore.replyingTo = props.message;
      break;
    case "edit":
      actionStore.triggerEdit(props.message);
      break;
    case "delete":
      actionStore.triggerDelete([props.message.id]);
      break;
    case "copy":
      actionStore.toggleSelection(props.message);
      actionStore.copyMessageText();
      break;
    case "select":
      actionStore.startSelectMode(props.message);
      break;
  }
}
</script>

<style scoped>
.chat-bubble-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 2px var(--chat-spacing-md);
}

.chat-bubble-wrapper--mine {
  align-items: flex-end;
}

.chat-bubble__date-separator {
  align-self: center;
  padding: var(--chat-spacing-sm) var(--chat-spacing-md);
  margin: var(--chat-spacing-md) 0;
  background: var(--chat-bg-tertiary);
  border-radius: var(--chat-radius-full);
  font-size: var(--chat-font-size-xs);
  color: var(--chat-text-secondary);
}

.chat-bubble {
  display: flex;
  align-items: flex-end;
  gap: var(--chat-spacing-xs);
  max-width: 75%;
  position: relative;
}

.chat-bubble__checkbox {
  display: flex;
  align-items: center;
  padding-right: var(--chat-spacing-xs);
}

.chat-bubble__avatar {
  flex-shrink: 0;
}

.chat-bubble__content {
  padding: var(--chat-spacing-sm) var(--chat-spacing-md);
  border-radius: var(--chat-radius-lg);
  position: relative;
  overflow: hidden;
}

.chat-bubble--mine .chat-bubble__content {
  background: var(--chat-bubble-mine);
  color: var(--chat-bubble-mine-text);
  border-bottom-right: 4px;
}

.chat-bubble--other .chat-bubble__content {
  background: var(--chat-bubble-other);
  color: var(--chat-bubble-other-text);
  border-bottom-left: 4px;
}

.chat-bubble--selected .chat-bubble__content {
  outline: 2px solid var(--chat-primary);
}

.chat-bubble__reply {
  padding: var(--chat-spacing-xs) var(--chat-spacing-sm);
  margin-bottom: var(--chat-spacing-xs);
  border-radius: var(--chat-radius-sm);
  background: rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.chat-bubble__reply-name {
  font-size: var(--chat-font-size-xs);
  font-weight: 600;
  opacity: 0.8;
}

.chat-bubble__reply-text {
  font-size: var(--chat-font-size-xs);
  opacity: 0.7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-bubble__text {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: var(--chat-font-size-md);
  line-height: 1.5;
}

.chat-bubble__footer {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  justify-content: flex-end;
}

.chat-bubble__edited {
  font-size: var(--chat-font-size-xs);
  opacity: 0.6;
  font-style: italic;
}

.chat-bubble__time {
  font-size: var(--chat-font-size-xs);
  opacity: 0.7;
}

.chat-bubble__status {
  display: flex;
  align-items: center;
  opacity: 0.7;
}
</style>
