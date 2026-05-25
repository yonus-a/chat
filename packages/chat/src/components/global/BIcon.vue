<template>
  <component
    :is="iconComponent"
    v-if="iconComponent"
    :size="size"
    :weight="weight"
    class="b-icon"
  />
  <span v-else class="b-icon" :style="{ fontSize: size + 'px' }">{{ name }}</span>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";

const props = withDefaults(
  defineProps<{
    name: string;
    size?: number;
    weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
  }>(),
  {
    size: 20,
    weight: "regular",
  },
);

const iconComponent = computed(() => {
  if (!props.name) return null;

  const pascalName = props.name
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("");

  return defineAsyncComponent(() =>
    import("@phosphor-icons/vue").then((mod) => {
      const component = (mod as Record<string, unknown>)[`Ph${pascalName}`];
      if (!component) {
        console.warn(`[@behayand/chat] Icon "Ph${pascalName}" not found`);
        return { render: () => null };
      }
      return component;
    }),
  );
});
</script>

<style scoped>
.b-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>
