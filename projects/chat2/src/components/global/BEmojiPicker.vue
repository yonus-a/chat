<template>
  <div v-if="visible" class="b-emoji-picker">
    <div class="b-emoji-picker__categories">
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="b-emoji-picker__cat-btn"
        :class="{ active: activeCategory === cat.id }"
        @click="activeCategory = cat.id"
      >
        {{ cat.icon }}
      </button>
    </div>
    <div class="b-emoji-picker__grid">
      <button
        v-for="emoji in filteredEmojis"
        :key="emoji.id"
        class="b-emoji-picker__emoji"
        @click="$emit('select', emoji.native)"
      >
        {{ emoji.native }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import data from "@emoji-mart/data";

defineProps<{ visible: boolean }>();
defineEmits<{ select: [emoji: string] }>();

const activeCategory = ref("people");

interface EmojiItem {
  id: string;
  native: string;
  category: string;
}

interface EmojiCategory {
  id: string;
  emojis?: string[];
}

interface EmojiMartData {
  emojis?: Record<string, { skins?: Array<{ native: string }> }>;
  categories?: EmojiCategory[];
}

const categories = [
  { id: "people", icon: "😀" },
  { id: "nature", icon: "🌿" },
  { id: "foods", icon: "🍔" },
  { id: "activity", icon: "⚽" },
  { id: "places", icon: "✈️" },
  { id: "objects", icon: "💡" },
  { id: "symbols", icon: "❤️" },
  { id: "flags", icon: "🏁" },
];

const allEmojis = computed<EmojiItem[]>(() => {
  const result: EmojiItem[] = [];
  const emojiData = data as EmojiMartData;
  if (!emojiData.emojis) return result;

  for (const [id, emoji] of Object.entries(emojiData.emojis)) {
    if (emoji.skins?.[0]) {
      result.push({
        id,
        native: emoji.skins[0].native,
        category: getCategoryForEmoji(id, emojiData),
      });
    }
  }

  return result;
});

function getCategoryForEmoji(emojiId: string, emojiData: EmojiMartData): string {
  if (!emojiData.categories) return "people";

  for (const category of emojiData.categories) {
    if (category.emojis?.includes(emojiId)) {
      return category.id;
    }
  }

  return "people";
}

const filteredEmojis = computed(() =>
  allEmojis.value.filter((emoji) => emoji.category === activeCategory.value),
);
</script>

<style scoped>
.b-emoji-picker {
  background: var(--chat-surface);
  border: 1px solid var(--chat-border);
  border-radius: var(--chat-radius-lg);
  box-shadow: var(--chat-shadow-lg);
  width: 320px;
  max-height: 360px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.b-emoji-picker__categories {
  display: flex;
  gap: 2px;
  padding: var(--chat-spacing-sm);
  border-bottom: 1px solid var(--chat-border);
  overflow-x: auto;
}

.b-emoji-picker__cat-btn {
  padding: 4px 8px;
  border: none;
  background: none;
  border-radius: var(--chat-radius-sm);
  cursor: pointer;
  font-size: 18px;
  opacity: 0.6;
  transition: all var(--chat-transition-fast);
}

.b-emoji-picker__cat-btn.active {
  opacity: 1;
  background: var(--chat-bg-tertiary);
}

.b-emoji-picker__grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 2px;
  padding: var(--chat-spacing-sm);
  overflow-y: auto;
  flex: 1;
}

.b-emoji-picker__emoji {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: none;
  background: none;
  border-radius: var(--chat-radius-sm);
  cursor: pointer;
  font-size: 22px;
  transition: background var(--chat-transition-fast);
}

.b-emoji-picker__emoji:hover {
  background: var(--chat-bg-tertiary);
}
</style>
