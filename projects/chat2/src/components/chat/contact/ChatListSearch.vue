<template>
  <div class="chat-list-search" :class="{ 'chat-list-search--open': isOpen }">
    <div class="chat-list-search__header">
      <button
        v-if="!isOpen"
        class="chat-list-search__toggle"
        @click="open"
      >
        <BIcon name="magnifying-glass" :size="20" />
      </button>
      <input
        v-if="isOpen"
        ref="inputRef"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        class="chat-list-search__input"
        :placeholder="placeholder"
      />
      <button
        v-if="isOpen"
        class="chat-list-search__close"
        @click="close"
      >
        <BIcon name="x" :size="18" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from "vue";
import BIcon from "../../global/BIcon.vue";

withDefaults(
  defineProps<{
    modelValue: string;
    placeholder?: string;
  }>(),
  {
    placeholder: "جستجو...",
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const isOpen = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);

function open() {
  isOpen.value = true;
  nextTick(() => inputRef.value?.focus());
}

function close() {
  isOpen.value = false;
  emit("update:modelValue", "");
}
</script>

<style scoped>
.chat-list-search {
  padding: var(--chat-spacing-sm) var(--chat-spacing-md);
}

.chat-list-search__header {
  display: flex;
  align-items: center;
  gap: var(--chat-spacing-sm);
}

.chat-list-search__toggle,
.chat-list-search__close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--chat-text-secondary);
  padding: var(--chat-spacing-xs);
  display: flex;
  align-items: center;
}

.chat-list-search__input {
  flex: 1;
  border: none;
  outline: none;
  background: var(--chat-bg-tertiary);
  padding: var(--chat-spacing-sm) var(--chat-spacing-md);
  border-radius: var(--chat-radius-full);
  font-family: var(--chat-font-family);
  font-size: var(--chat-font-size-md);
  color: var(--chat-text);
}

.chat-list-search__input::placeholder {
  color: var(--chat-text-tertiary);
}
</style>
