<template>
  <div
    ref="containerRef"
    class="b-virtual-list"
    :style="{ height: containerHeight }"
    @scroll="onScroll"
  >
    <div :style="{ height: `${totalSize}px`, position: 'relative' }">
      <div
        v-for="item in virtualItems"
        :key="item.index"
        :style="{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${item.start}px)`,
        }"
        :data-index="item.index"
        :ref="(el) => measureElement(el as HTMLElement | null)"
      >
        <slot :item="items[item.index]" :index="item.index" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useVirtualizer } from "@tanstack/vue-virtual";

const props = withDefaults(
  defineProps<{
    items: unknown[];
    estimateSize?: number;
    overscan?: number;
    height?: string;
    onLoadMore?: () => void;
    loadMoreThreshold?: number;
  }>(),
  {
    estimateSize: 76,
    overscan: 5,
    height: "100%",
    loadMoreThreshold: 200,
  },
);

const containerRef = ref<HTMLElement | null>(null);
const containerHeight = computed(() => props.height);

const virtualizer = useVirtualizer(
  computed(() => ({
    count: props.items.length,
    getScrollElement: () => containerRef.value,
    estimateSize: () => props.estimateSize,
    overscan: props.overscan,
  })),
);

const virtualItems = computed(() => virtualizer.value.getVirtualItems());
const totalSize = computed(() => virtualizer.value.getTotalSize());

function measureElement(el: HTMLElement | null) {
  if (el) {
    virtualizer.value.measureElement(el);
  }
}

function onScroll() {
  if (!containerRef.value || !props.onLoadMore) return;

  const { scrollTop, scrollHeight, clientHeight } = containerRef.value;
  if (scrollHeight - scrollTop - clientHeight < props.loadMoreThreshold) {
    props.onLoadMore();
  }
}

defineExpose({
  virtualizer,
  scrollToIndex: (index: number) => virtualizer.value.scrollToIndex(index),
  scrollToOffset: (offset: number) => virtualizer.value.scrollToOffset(offset),
});
</script>

<style scoped>
.b-virtual-list {
  overflow-y: auto;
  overflow-x: hidden;
  contain: strict;
}
</style>
