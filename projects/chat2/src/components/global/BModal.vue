<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="b-modal-overlay" @click.self="close">
        <div class="b-modal" :class="[`b-modal--${size}`]">
          <div v-if="title" class="b-modal__header">
            <h3 class="b-modal__title">{{ title }}</h3>
            <button class="b-modal__close" @click="close">×</button>
          </div>
          <div class="b-modal__body">
            <slot />
          </div>
          <div v-if="$slots.footer" class="b-modal__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    size?: "sm" | "md" | "lg";
    persistent?: boolean;
  }>(),
  {
    size: "md",
    persistent: false,
  },
);

const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();

function close() {
  if (!props.persistent) {
    emit("update:modelValue", false);
  }
}
</script>

<style scoped>
.b-modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: var(--chat-z-modal);
  padding: var(--chat-spacing-lg);
}

.b-modal {
  background: var(--chat-surface);
  border-radius: var(--chat-radius-lg);
  box-shadow: var(--chat-shadow-lg);
  max-height: 90vh;
  overflow-y: auto;
  width: 100%;
}

.b-modal--sm { max-width: 360px; }
.b-modal--md { max-width: 480px; }
.b-modal--lg { max-width: 640px; }

.b-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--chat-spacing-lg);
  border-bottom: 1px solid var(--chat-border);
}

.b-modal__title {
  margin: 0;
  font-size: var(--chat-font-size-lg);
  color: var(--chat-text);
}

.b-modal__close {
  background: none;
  border: none;
  font-size: var(--chat-font-size-2xl);
  cursor: pointer;
  color: var(--chat-text-secondary);
  padding: var(--chat-spacing-xs);
  line-height: 1;
}

.b-modal__body {
  padding: var(--chat-spacing-lg);
}

.b-modal__footer {
  display: flex;
  gap: var(--chat-spacing-sm);
  justify-content: flex-end;
  padding: var(--chat-spacing-md) var(--chat-spacing-lg);
  border-top: 1px solid var(--chat-border);
}

.modal-enter-active, .modal-leave-active {
  transition: opacity var(--chat-transition-normal);
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
</style>
