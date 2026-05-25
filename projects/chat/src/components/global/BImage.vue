<template>
  <div class="b-image" :class="{ 'b-image--loading': isLoading, 'b-image--error': hasError }">
    <img
      v-if="src && !hasError"
      :src="src"
      :alt="alt"
      :style="imgStyle"
      @load="onLoad"
      @error="onError"
      class="b-image__img"
    />
    <div
      v-else
      class="b-image__placeholder"
      :style="imgStyle"
      :aria-label="alt"
      :title="alt"
      role="img"
    >
      <slot name="placeholder">
        <span class="b-image__placeholder-text">{{ alt?.charAt(0) || '?' }}</span>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    src?: string;
    alt?: string;
    width?: string | number;
    height?: string | number;
    objectFit?: "cover" | "contain" | "fill";
    rounded?: boolean;
  }>(),
  {
    objectFit: "cover",
    rounded: false,
  },
);

const isLoading = ref(Boolean(props.src));
const hasError = ref(false);

const imgStyle = computed(() => ({
  width: props.width ? (typeof props.width === "number" ? `${props.width}px` : props.width) : "100%",
  height: props.height ? (typeof props.height === "number" ? `${props.height}px` : props.height) : "100%",
  objectFit: props.objectFit,
  borderRadius: props.rounded ? "var(--chat-radius-full)" : undefined,
}));

watch(
  () => props.src,
  (src) => {
    isLoading.value = Boolean(src);
    hasError.value = false;
  },
);

function onLoad() {
  isLoading.value = false;
}

function onError() {
  isLoading.value = false;
  hasError.value = true;
}
</script>

<style scoped>
.b-image {
  position: relative;
  overflow: hidden;
  display: inline-flex;
}

.b-image__img {
  display: block;
  transition: opacity var(--chat-transition-fast);
}

.b-image--loading .b-image__img {
  opacity: 0;
}

.b-image__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: var(--chat-bg-tertiary);
  color: var(--chat-text-tertiary);
}

.b-image__placeholder-text {
  font-size: var(--chat-font-size-xl);
  font-weight: 600;
}
</style>
