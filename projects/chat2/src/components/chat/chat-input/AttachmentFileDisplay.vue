<template>
  <div class="attachment-file">
    <div class="attachment-file__icon">
      <BIcon name="file" :size="20" />
    </div>
    <div class="attachment-file__info">
      <span class="attachment-file__name">{{ file.name }}</span>
      <span class="attachment-file__size">{{ formatBytes(file.size) }}</span>
    </div>
    <button class="attachment-file__remove" @click="$emit('remove')">
      <BIcon name="x" :size="16" />
    </button>
  </div>
</template>

<script setup lang="ts">
import BIcon from "../../global/BIcon.vue";
import { formatBytes } from "../../../utils/format";

defineProps<{ file: File }>();
defineEmits<{ remove: [] }>();
</script>

<style scoped>
.attachment-file {
  display: flex;
  align-items: center;
  gap: var(--chat-spacing-sm);
  padding: var(--chat-spacing-sm) var(--chat-spacing-md);
  background: var(--chat-bg-tertiary);
  border-radius: var(--chat-radius-md);
}

.attachment-file__icon {
  color: var(--chat-primary);
}

.attachment-file__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.attachment-file__name {
  font-size: var(--chat-font-size-sm);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.attachment-file__size {
  font-size: var(--chat-font-size-xs);
  color: var(--chat-text-tertiary);
}

.attachment-file__remove {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--chat-text-secondary);
  padding: 4px;
}
</style>
