<template>
  <div class="input-attachment">
    <div class="input-attachment__options">
      <button class="input-attachment__option" @click="selectImages">
        <BIcon name="image" :size="24" />
        <span>{{ t("photo") }}</span>
      </button>
      <button class="input-attachment__option" @click="selectFile">
        <BIcon name="file" :size="24" />
        <span>{{ t("file") }}</span>
      </button>
      <button class="input-attachment__option" @click="$emit('recordVideo')">
        <BIcon name="video-camera" :size="24" />
        <span>{{ t("video") }}</span>
      </button>
    </div>
    <input
      ref="imageInput"
      type="file"
      accept="image/*"
      multiple
      hidden
      @change="onImagesSelected"
    />
    <input
      ref="fileInput"
      type="file"
      hidden
      @change="onFileSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import BIcon from "../../global/BIcon.vue";
import { t } from "../../../i18n";

const emit = defineEmits<{
  images: [files: File[]];
  file: [file: File];
  recordVideo: [];
}>();

const imageInput = ref<HTMLInputElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

function selectImages() {
  imageInput.value?.click();
}

function selectFile() {
  fileInput.value?.click();
}

function onImagesSelected(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.files?.length) {
    emit("images", Array.from(input.files));
    input.value = "";
  }
}

function onFileSelected(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.files?.[0]) {
    emit("file", input.files[0]);
    input.value = "";
  }
}
</script>

<style scoped>
.input-attachment__options {
  display: flex;
  gap: var(--chat-spacing-md);
  padding: var(--chat-spacing-md);
}

.input-attachment__option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--chat-spacing-xs);
  padding: var(--chat-spacing-md);
  border: none;
  background: var(--chat-bg-tertiary);
  border-radius: var(--chat-radius-md);
  cursor: pointer;
  color: var(--chat-text-secondary);
  font-size: var(--chat-font-size-sm);
  transition: all var(--chat-transition-fast);
}

.input-attachment__option:hover {
  background: var(--chat-surface-active);
  color: var(--chat-primary);
}
</style>
