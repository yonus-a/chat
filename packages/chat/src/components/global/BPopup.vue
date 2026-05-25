<template>
  <Teleport to="body">
    <Transition name="popup">
      <div v-if="modelValue" class="b-popup-overlay" @click.self="close">
        <div class="b-popup" :class="{ 'b-popup--fullscreen': fullscreen }">
          <div v-if="title || closable" class="b-popup__header">
            <h3 v-if="title" class="b-popup__title">{{ title }}</h3>
            <button v-if="closable" class="b-popup__close" @click="close">×</button>
          </div>
          <div class="b-popup__body">
            <slot />
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
    fullscreen?: boolean;
    closable?: boolean;
  }>(),
  {
    fullscreen: false,
    closable: true,
  },
);

const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();

function close() {
  emit("update:modelValue", false);
}
</script>

<style scoped>
.b-popup-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: var(--chat-z-popup);
}

.b-popup {
  background: var(--chat-surface);
  border-radius: var(--chat-radius-xl) var(--chat-radius-xl) 0 0;
  width: 100%;
  max-width: 480px;
  max-height: 85vh;
  overflow-y: auto;
}

.b-popup--fullscreen {
  max-width: 100%;
  max-height: 100%;
  border-radius: 0;
  height: 100%;
}

.b-popup__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--chat-spacing-lg);
  position: sticky;
  top: 0;
  background: var(--chat-surface);
  z-index: 1;
}

.b-popup__title {
  margin: 0;
  font-size: var(--chat-font-size-lg);
  color: var(--chat-text);
}

.b-popup__close {
  background: none;
  border: none;
  font-size: var(--chat-font-size-2xl);
  cursor: pointer;
  color: var(--chat-text-secondary);
}

.b-popup__body {
  padding: 0 var(--chat-spacing-lg) var(--chat-spacing-lg);
}

.popup-enter-active, .popup-leave-active {
  transition: all var(--chat-transition-normal);
}
.popup-enter-from, .popup-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>
