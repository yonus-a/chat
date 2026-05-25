<template>
  <div class="b-tab">
    <div class="b-tab__header">
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        class="b-tab__item"
        :class="{ 'b-tab__item--active': modelValue === index }"
        @click="$emit('update:modelValue', index)"
      >
        {{ tab }}
      </button>
      <div class="b-tab__indicator" :style="indicatorStyle"></div>
    </div>
    <div class="b-tab__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    tabs: string[];
    modelValue: number;
  }>(),
  {
    modelValue: 0,
  },
);

defineEmits<{ "update:modelValue": [index: number] }>();

const indicatorStyle = computed(() => ({
  width: props.tabs.length ? `${100 / props.tabs.length}%` : "0%",
  transform: `translateX(${props.modelValue * 100}%)`,
}));
</script>

<style scoped>
.b-tab__header {
  display: flex;
  position: relative;
  border-bottom: 1px solid var(--chat-border);
}

.b-tab__item {
  flex: 1;
  padding: var(--chat-spacing-sm) var(--chat-spacing-md);
  border: none;
  background: none;
  cursor: pointer;
  font-family: var(--chat-font-family);
  font-size: var(--chat-font-size-md);
  color: var(--chat-text-secondary);
  transition: color var(--chat-transition-fast);
}

.b-tab__item--active {
  color: var(--chat-primary);
  font-weight: 500;
}

.b-tab__indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: var(--chat-primary);
  transition: transform var(--chat-transition-normal);
}

.b-tab__content {
  padding: var(--chat-spacing-md) 0;
}
</style>
