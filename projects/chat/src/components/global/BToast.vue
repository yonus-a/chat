<template>
  <Teleport to="body">
    <div class="b-toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="b-toast"
          :class="[`b-toast--${toast.type}`]"
          @click="closeToast(toast.id)"
        >
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useAppToast } from "../../composables/useAppToast";

const { toasts, closeToast } = useAppToast();
</script>

<style scoped>
.b-toast-container {
  position: fixed;
  top: var(--chat-spacing-lg);
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--chat-z-toast);
  display: flex;
  flex-direction: column;
  gap: var(--chat-spacing-sm);
  pointer-events: none;
}

.b-toast {
  padding: var(--chat-spacing-sm) var(--chat-spacing-lg);
  border-radius: var(--chat-radius-md);
  font-size: var(--chat-font-size-md);
  font-family: var(--chat-font-family);
  box-shadow: var(--chat-shadow-md);
  pointer-events: auto;
  cursor: pointer;
  max-width: 360px;
  text-align: center;
}

.b-toast--success { background: var(--chat-success); color: var(--chat-text-inverse); }
.b-toast--error { background: var(--chat-error); color: var(--chat-text-inverse); }
.b-toast--warning { background: var(--chat-warning); color: var(--chat-text-inverse); }
.b-toast--info { background: var(--chat-info); color: var(--chat-text-inverse); }

.toast-enter-active, .toast-leave-active {
  transition: all var(--chat-transition-normal);
}
.toast-enter-from { opacity: 0; transform: translateY(-20px); }
.toast-leave-to { opacity: 0; transform: translateY(-20px); }
</style>
