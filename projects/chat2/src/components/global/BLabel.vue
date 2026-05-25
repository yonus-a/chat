<template>
  <span
    class="b-label"
    :class="[
      `b-label--${size}`,
      `b-label--${type}`,
      `b-label--${color}`,
      { 'b-label--active': active },
    ]"
    @click="$emit('click')"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: "xs" | "sm" | "md" | "lg";
    type?: "fill" | "outline" | "ghost";
    color?: "primary" | "success" | "warning" | "error" | "neutral";
    active?: boolean;
  }>(),
  {
    size: "md",
    type: "fill",
    color: "primary",
    active: false,
  },
);

defineEmits<{ click: [] }>();
</script>

<style scoped>
.b-label {
  display: inline-flex;
  align-items: center;
  gap: var(--chat-spacing-xs);
  border-radius: var(--chat-radius-full);
  font-family: var(--chat-font-family);
  cursor: pointer;
  transition: all var(--chat-transition-fast);
  user-select: none;
}

.b-label--xs { padding: 2px 8px; font-size: var(--chat-font-size-xs); }
.b-label--sm { padding: 4px 10px; font-size: var(--chat-font-size-sm); }
.b-label--md { padding: 6px 12px; font-size: var(--chat-font-size-md); }
.b-label--lg { padding: 8px 16px; font-size: var(--chat-font-size-lg); }

.b-label--fill.b-label--primary { background: var(--chat-bg-tertiary); color: var(--chat-text-secondary); }
.b-label--fill.b-label--primary.b-label--active { background: var(--chat-primary); color: var(--chat-text-inverse); }
.b-label--fill.b-label--neutral { background: var(--chat-bg-tertiary); color: var(--chat-text); }
.b-label--fill.b-label--success { background: var(--chat-success); color: var(--chat-text-inverse); }
.b-label--fill.b-label--error { background: var(--chat-error); color: var(--chat-text-inverse); }
.b-label--fill.b-label--warning { background: var(--chat-warning); color: var(--chat-text-inverse); }

.b-label--outline { background: transparent; border: 1px solid var(--chat-border); color: var(--chat-text); }
.b-label--outline.b-label--active { border-color: var(--chat-primary); color: var(--chat-primary); }

.b-label--ghost { background: transparent; color: var(--chat-text-secondary); }
.b-label--ghost.b-label--active { color: var(--chat-primary); }
</style>
