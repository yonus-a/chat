<template>
  <div class="file-display" @click="$emit('download')">
    <div class="file-display__icon">
      <BIcon name="file" :size="24" />
    </div>
    <div class="file-display__info">
      <span class="file-display__name">{{ fileName }}</span>
      <span class="file-display__size">{{ formattedSize }}</span>
    </div>
    <div v-if="progress !== undefined && progress < 100" class="file-display__progress">
      <div class="file-display__progress-bar" :style="{ width: progress + '%' }"></div>
    </div>
    <BIcon v-else name="download-simple" :size="20" class="file-display__download" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import BIcon from "../../global/BIcon.vue";
import { formatBytes } from "../../../utils/format";

const props = defineProps<{
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  progress?: number;
}>();

defineEmits<{ download: [] }>();

const formattedSize = computed(() =>
  props.fileSize ? formatBytes(props.fileSize) : "",
);
</script>

<style scoped>
.file-display {
  display: flex;
  align-items: center;
  gap: var(--chat-spacing-md);
  padding: var(--chat-spacing-sm) var(--chat-spacing-md);
  background: rgba(0, 0, 0, 0.05);
  border-radius: var(--chat-radius-md);
  cursor: pointer;
  min-width: 200px;
}

.file-display__icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--chat-primary-light);
  color: var(--chat-text-inverse);
  border-radius: var(--chat-radius-sm);
  flex-shrink: 0;
}

.file-display__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.file-display__name {
  font-size: var(--chat-font-size-sm);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-display__size {
  font-size: var(--chat-font-size-xs);
  opacity: 0.7;
}

.file-display__progress {
  width: 100%;
  height: 3px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  position: absolute;
  bottom: 0;
  left: 0;
}

.file-display__progress-bar {
  height: 100%;
  background: var(--chat-primary);
  border-radius: 2px;
  transition: width var(--chat-transition-fast);
}

.file-display__download {
  opacity: 0.6;
  flex-shrink: 0;
}
</style>
