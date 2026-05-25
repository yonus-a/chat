<template>
  <span class="safe-emoji-text">
    <template v-for="(segment, idx) in segments" :key="idx">
      <img
        v-if="segment.type === 'emoji'"
        :src="`https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/72x72/${segment.hexFileName}.png`"
        :alt="segment.value"
        class="safe-emoji-text__emoji"
        draggable="false"
      />
      <span v-else>{{ segment.value }}</span>
    </template>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { parseEmojiArray } from "../../utils/emojiParser";

const props = defineProps<{ text: string }>();

const segments = computed(() => parseEmojiArray(props.text));
</script>

<style scoped>
.safe-emoji-text {
  display: inline;
  word-break: break-word;
}

.safe-emoji-text__emoji {
  display: inline-block;
  width: 1.2em;
  height: 1.2em;
  vertical-align: -0.2em;
  margin: 0 1px;
}
</style>
