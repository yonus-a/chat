<template>
  <component 
    :is="iconComponent" 
    :weight="weight" 
    :size="size" 
    v-bind="$attrs" 
    :class="[
      'inline-block fill-current transition-all duration-200',
      $attrs.class
    ]" 
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
// This imports the whole library so any string will work
import * as PhosphorIcons from "@phosphor-icons/vue";

const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  weight: {
    type: String,
    default: "regular"
  },
  size: {
    type: [String, Number],
    default: "1em"
  }
});

const iconComponent = computed(() => {
  if (!props.icon) return "span";

  let name = props.icon;
  // Ensure the name matches the Phosphor component naming (e.g., PhUser)
  if (!name.startsWith('Ph')) {
    name = 'Ph' + name.charAt(0).toUpperCase() + name.slice(1);
  } else {
    name = name.charAt(0).toUpperCase() + name.slice(1);
  }

  return (PhosphorIcons as any)[name] || "span";
});
</script>