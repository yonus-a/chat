<template>
  <div class="contact-avatar" :class="[`contact-avatar--${size}`]">
    <div class="contact-avatar__image-wrapper">
      <img
        v-if="imageUrl && !imgError"
        :src="imageUrl"
        :alt="displayName"
        class="contact-avatar__img"
        @error="imgError = true"
      />
      <div v-else class="contact-avatar__initials" :class="{ 'contact-avatar__initials--rtl': isRtl }">
        {{ initials }}
      </div>
    </div>
    <span v-if="showOnline && isOnline" class="contact-avatar__status"></span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

const props = withDefaults(
  defineProps<{
    imageUrl?: string;
    name?: string;
    lastName?: string;
    isOnline?: boolean;
    showOnline?: boolean;
    size?: "sm" | "md" | "lg" | "xl";
  }>(),
  {
    showOnline: true,
    size: "md",
    isOnline: false,
  },
);

const imgError = ref(false);

const displayName = computed(() => `${props.name || ""} ${props.lastName || ""}`.trim());

const isRtl = computed(() => {
  const firstChar = (props.name || "")[0];
  if (!firstChar) return false;
  const code = firstChar.charCodeAt(0);
  return (code >= 0x0600 && code <= 0x06ff) || (code >= 0xfb50 && code <= 0xfdff);
});

const initials = computed(() => {
  const first = (props.name || "?")[0];
  const last = (props.lastName || "")[0];
  return `${first}${last || ""}`;
});
</script>

<style scoped>
.contact-avatar {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
}

.contact-avatar--sm .contact-avatar__image-wrapper { width: var(--chat-avatar-sm); height: var(--chat-avatar-sm); }
.contact-avatar--md .contact-avatar__image-wrapper { width: var(--chat-avatar-md); height: var(--chat-avatar-md); }
.contact-avatar--lg .contact-avatar__image-wrapper { width: var(--chat-avatar-lg); height: var(--chat-avatar-lg); }
.contact-avatar--xl .contact-avatar__image-wrapper { width: var(--chat-avatar-xl); height: var(--chat-avatar-xl); }

.contact-avatar__image-wrapper {
  border-radius: var(--chat-radius-full);
  overflow: hidden;
  background: var(--chat-bg-tertiary);
}

.contact-avatar__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.contact-avatar__initials {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--chat-primary-light);
  color: var(--chat-text-inverse);
  font-weight: 600;
  font-size: var(--chat-font-size-md);
}

.contact-avatar__initials--rtl {
  direction: rtl;
}

.contact-avatar__status {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--chat-online);
  border: 2px solid var(--chat-surface);
}
</style>
