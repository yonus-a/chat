<template>
  <button
    class="b-button"
    :class="[
      `b-button--${type}`,
      `b-button--${size}`,
      `b-button--${color}`,
      { 'b-button--loading': loading, 'b-button--disabled': disabled },
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="b-button__loader"></span>
    <slot v-else />
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: "fill" | "outline" | "ghost" | "text";
    size?: "xs" | "sm" | "md" | "lg";
    color?: "primary" | "success" | "warning" | "error" | "neutral";
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    type: "fill",
    size: "md",
    color: "primary",
    loading: false,
    disabled: false,
  },
);

defineEmits<{ click: [event: MouseEvent] }>();
</script>

<style scoped>
.b-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--chat-spacing-sm);
  border: none;
  cursor: pointer;
  font-family: var(--chat-font-family);
  font-weight: 500;
  border-radius: var(--chat-radius-md);
  transition: all var(--chat-transition-fast);
  white-space: nowrap;
}

.b-button--xs { padding: 4px 8px; font-size: var(--chat-font-size-xs); }
.b-button--sm { padding: 6px 12px; font-size: var(--chat-font-size-sm); }
.b-button--md { padding: 8px 16px; font-size: var(--chat-font-size-md); }
.b-button--lg { padding: 12px 24px; font-size: var(--chat-font-size-lg); }

.b-button--fill.b-button--primary {
  background: var(--chat-primary);
  color: var(--chat-text-inverse);
}
.b-button--fill.b-button--primary:hover {
  background: var(--chat-primary-dark);
}
.b-button--fill.b-button--success { background: var(--chat-success); color: var(--chat-text-inverse); }
.b-button--fill.b-button--error { background: var(--chat-error); color: var(--chat-text-inverse); }
.b-button--fill.b-button--warning { background: var(--chat-warning); color: var(--chat-text-inverse); }
.b-button--fill.b-button--neutral { background: var(--chat-surface-active); color: var(--chat-text); }

.b-button--outline {
  background: transparent;
  border: 1px solid var(--chat-border);
  color: var(--chat-text);
}
.b-button--outline:hover { background: var(--chat-surface-hover); }

.b-button--ghost { background: transparent; color: var(--chat-text); }
.b-button--ghost:hover { background: var(--chat-surface-hover); }

.b-button--text { background: transparent; color: var(--chat-primary); padding: 0; }

.b-button--disabled { opacity: 0.5; cursor: not-allowed; }
.b-button--loading { cursor: wait; }

.b-button__loader {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
