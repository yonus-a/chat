<template>
  <div
    class="chat-contact"
    :class="{ 'chat-contact--active': isActive, 'chat-contact--skeleton': isSkeleton }"
    @click="$emit('select', contact.id)"
  >
    <ContactAvatar
      :image-url="contact.imageUrl"
      :name="contact.name"
      :last-name="contact.lastName"
      :is-online="contact.isOnline"
      size="md"
    />
    <div class="chat-contact__info">
      <div class="chat-contact__top">
        <span class="chat-contact__name">{{ contact.name }} {{ contact.lastName }}</span>
        <span v-if="contact.lastMessage" class="chat-contact__time">
          {{ formatRelative(contact.lastMessage.date) }}
        </span>
      </div>
      <div class="chat-contact__bottom">
        <span class="chat-contact__message">
          <SafeEmojiText v-if="contact.lastMessage?.text" :text="lastMessagePreview" />
          <span v-else-if="contact.lastMessage" class="chat-contact__attachment">
            {{ attachmentLabel }}
          </span>
        </span>
        <span v-if="contact.unreadCount" class="chat-contact__badge">
          {{ contact.unreadCount > 9 ? '9+' : contact.unreadCount }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useDate } from "../../../composables/useDate";
import type { Contact } from "../../../types";
import SafeEmojiText from "../../general/SafeEmojiText.vue";
import ContactAvatar from "./ContactAvatar.vue";

const props = defineProps<{
  contact: Contact;
  isActive?: boolean;
}>();

defineEmits<{ select: [id: number] }>();

const { formatRelativeDate } = useDate();

const isSkeleton = computed(() => props.contact.id < 0);

const lastMessagePreview = computed(() => {
  const text = props.contact.lastMessage?.text || "";
  return text.length > 40 ? `${text.slice(0, 40)}...` : text;
});

const attachmentLabel = computed(() => {
  const type = props.contact.lastMessage?.type;
  if (type === "image") return "📷 عکس";
  if (type === "voice") return "🎤 ویس";
  if (type === "video") return "🎥 ویدیو";
  if (type === "file") return "📎 فایل";
  return "";
});

function formatRelative(date: Date | string) {
  return formatRelativeDate(date);
}
</script>

<style scoped>
.chat-contact {
  display: flex;
  align-items: center;
  gap: var(--chat-spacing-md);
  padding: var(--chat-spacing-md) var(--chat-spacing-lg);
  cursor: pointer;
  transition: background var(--chat-transition-fast);
  border-radius: var(--chat-radius-md);
}

.chat-contact:hover {
  background: var(--chat-surface-hover);
}

.chat-contact--active {
  background: var(--chat-surface-active);
}

.chat-contact--skeleton {
  opacity: 0.5;
  animation: pulse 1.5s ease-in-out infinite;
}

.chat-contact__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chat-contact__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-contact__name {
  font-weight: 500;
  font-size: var(--chat-font-size-md);
  color: var(--chat-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-contact__time {
  font-size: var(--chat-font-size-xs);
  color: var(--chat-text-tertiary);
  flex-shrink: 0;
}

.chat-contact__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-contact__message {
  font-size: var(--chat-font-size-sm);
  color: var(--chat-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.chat-contact__attachment {
  color: var(--chat-text-tertiary);
}

.chat-contact__badge {
  background: var(--chat-primary);
  color: var(--chat-text-inverse);
  font-size: var(--chat-font-size-xs);
  min-width: 20px;
  height: 20px;
  border-radius: var(--chat-radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  flex-shrink: 0;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.3; }
}
</style>
