<template>
  <div class="no-data-display">
    <BImage
      v-if="image"
      :src="image"
      :alt="text"
      class="no-data-display__image"
      :width="imageSize"
      :height="imageSize"
      object-fit="contain"
    />
    <p v-if="text" class="no-data-display__text">{{ text }}</p>
    <slot />
  </div>
</template>

<script setup lang="ts">
import BImage from "../global/BImage.vue";

withDefaults(
  defineProps<{
    image?: string;
    text?: string;
    imageSize?: number;
  }>(),
  {
    imageSize: 200,
  },
);
</script>

<style scoped>
.no-data-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--chat-spacing-2xl);
  text-align: center;
  height: 100%;
}

.no-data-display__image {
  margin-bottom: var(--chat-spacing-lg);
  opacity: 0.7;
}

.no-data-display__text {
  color: var(--chat-text-secondary);
  font-size: var(--chat-font-size-md);
  margin: 0;
}
</style>
