<template>
  <component 
    :is="truncate ? 'div' : 'span'"
    :class="[
      truncate 
        ? 'line-clamp-1 overflow-hidden text-ellipsis break-all w-full' 
        : 'inline whitespace-pre-wrap break-words'
    ]"
  >
    <template v-for="(chunk, index) in parsedText" :key="index">
      
      <img
        v-if="chunk.type === 'emoji'"
        :src="`/emojis/apple/webp/${chunk.hex}.webp`"
        :alt="chunk.content"
        class="inline-block w-4.5 h-4.5 align-middle select-text pointer-events-none"
        loading="lazy"
      />
      
      <span v-else>{{ chunk.content }}</span>
      
    </template>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { parseEmojiArray } from '~/utils/emojiParser';

const props = defineProps({
  text: { type: String, default: '' },
  truncate: { type: Boolean, default: false } // Trigger from parent
});

const parsedText = computed(() => parseEmojiArray(props.text));
</script>