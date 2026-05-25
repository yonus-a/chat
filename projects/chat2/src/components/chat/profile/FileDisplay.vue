<template>
  <div class="profile-file" @click="$emit('open')">
    <div class="profile-file__icon">
      <BIcon name="file" :size="20" />
    </div>
    <div class="profile-file__info">
      <span class="profile-file__name">{{ name }}</span>
      <span class="profile-file__size">{{ size }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import BIcon from "../../global/BIcon.vue";

defineProps<{
  name: string;
  size?: string;
  url?: string;
}>();

defineEmits<{ open: [] }>();
</script>

<style scoped>
.profile-file {
  display: flex;
  align-items: center;
  gap: var(--chat-spacing-sm);
  padding: var(--chat-spacing-sm) var(--chat-spacing-md);
  border-radius: var(--chat-radius-md);
  cursor: pointer;
  transition: background var(--chat-transition-fast);
}

.profile-file:hover {
  background: var(--chat-surface-hover);
}

.profile-file__icon {
  color: var(--chat-primary);
}

.profile-file__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.profile-file__name {
  font-size: var(--chat-font-size-sm);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--chat-text);
}

.profile-file__size {
  font-size: var(--chat-font-size-xs);
  color: var(--chat-text-tertiary);
}
</style>
