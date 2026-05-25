<template>
  <div class="image-group" :class="`image-group--count-${Math.min(images.length, 4)}`">
    <div
      v-for="(img, idx) in displayImages"
      :key="idx"
      class="image-group__item"
      @click="$emit('preview', idx)"
    >
      <img :src="img" :alt="`Image ${idx + 1}`" class="image-group__img" />
      <div v-if="idx === 3 && images.length > 4" class="image-group__more">
        +{{ images.length - 4 }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  images: string[];
}>();

defineEmits<{ preview: [index: number] }>();

const displayImages = computed(() => props.images.slice(0, 4));
</script>

<style scoped>
.image-group {
  display: grid;
  gap: 2px;
  border-radius: var(--chat-radius-md);
  overflow: hidden;
  max-width: 280px;
}

.image-group--count-1 { grid-template-columns: 1fr; }
.image-group--count-2 { grid-template-columns: 1fr 1fr; }
.image-group--count-3 { grid-template-columns: 1fr 1fr; }
.image-group--count-4 { grid-template-columns: 1fr 1fr; }

.image-group__item {
  position: relative;
  aspect-ratio: 1;
  cursor: pointer;
  overflow: hidden;
}

.image-group--count-1 .image-group__item { aspect-ratio: 4/3; }

.image-group__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--chat-transition-fast);
}

.image-group__item:hover .image-group__img {
  transform: scale(1.05);
}

.image-group__more {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: var(--chat-font-size-xl);
  font-weight: 600;
}
</style>
