<template>
  <div class="chat-page-bar">
    <button v-if="showBack" class="chat-page-bar__back" @click="$emit('back')">
      <BIcon name="arrow-left" :size="20" />
    </button>

    <ContactAvatar
      :image-url="contact?.imageUrl"
      :name="contact?.name"
      :last-name="contact?.lastName"
      :is-online="contact?.isOnline"
      size="md"
      @click="$emit('openProfile')"
    />

    <div class="chat-page-bar__info" @click="$emit('openProfile')">
      <span class="chat-page-bar__name">{{ contact?.name }} {{ contact?.lastName }}</span>
      <span class="chat-page-bar__status">
        {{ contact?.isOnline ? t("online") : lastSeenText }}
      </span>
    </div>

    <div class="chat-page-bar__actions">
      <button class="chat-page-bar__action" @click="$emit('call', 'voice')">
        <BIcon name="phone" :size="20" />
      </button>
      <button class="chat-page-bar__action" @click="$emit('call', 'video')">
        <BIcon name="video-camera" :size="20" />
      </button>

      <BMenu position="bottom-end">
        <template #trigger>
          <button class="chat-page-bar__action">
            <BIcon name="dots-three-vertical" :size="20" />
          </button>
        </template>
        <div class="chat-page-bar__menu">
          <slot name="menu" />
        </div>
      </BMenu>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Contact } from "../../types";
import { useDate } from "../../composables/useDate";
import { t } from "../../i18n";
import BIcon from "../global/BIcon.vue";
import BMenu from "../global/BMenu.vue";
import ContactAvatar from "./contact/ContactAvatar.vue";

const props = defineProps<{
  contact?: Contact | null;
  showBack?: boolean;
}>();

defineEmits<{
  back: [];
  openProfile: [];
  call: [type: "voice" | "video"];
}>();

const { formatRelativeDate } = useDate();

const lastSeenText = computed(() => {
  if (!props.contact?.lastSeen) return "";
  return formatRelativeDate(props.contact.lastSeen);
});
</script>

<style scoped>
.chat-page-bar {
  display: flex;
  align-items: center;
  gap: var(--chat-spacing-md);
  padding: var(--chat-spacing-sm) var(--chat-spacing-lg);
  border-bottom: 1px solid var(--chat-border);
  background: var(--chat-bg);
  min-height: 60px;
}

.chat-page-bar__back {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--chat-text);
  padding: var(--chat-spacing-xs);
  display: flex;
}

.chat-page-bar__info {
  flex: 1;
  min-width: 0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.chat-page-bar__name {
  font-weight: 500;
  font-size: var(--chat-font-size-md);
  color: var(--chat-text);
}

.chat-page-bar__status {
  font-size: var(--chat-font-size-sm);
  color: var(--chat-text-secondary);
}

.chat-page-bar__actions {
  display: flex;
  align-items: center;
  gap: var(--chat-spacing-xs);
}

.chat-page-bar__action {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--chat-text-secondary);
  padding: var(--chat-spacing-xs);
  border-radius: var(--chat-radius-full);
  display: flex;
  transition: all var(--chat-transition-fast);
}

.chat-page-bar__action:hover {
  color: var(--chat-text);
  background: var(--chat-surface-hover);
}

.chat-page-bar__menu {
  min-width: 160px;
}
</style>
