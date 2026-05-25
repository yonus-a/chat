<template>
  <div class="chat-list">
    <ChatListSearch v-model="searchQuery" :placeholder="t('searchPlaceholder')" />

    <div class="chat-list__filters">
      <BLabel
        v-for="filter in filters"
        :key="filter.key"
        size="sm"
        :active="activeFilter === filter.key"
        @click="setFilter(filter.key)"
      >
        {{ filter.label }}
      </BLabel>
    </div>

    <div class="chat-list__content">
      <BVirtualVerticalList
        v-if="displayedContacts.length > 0"
        :items="displayedContacts"
        :estimate-size="76"
        height="100%"
        :on-load-more="loadMore"
      >
        <template #default="{ item }">
          <ChatContactDisplay
            :contact="item as Contact"
            :is-active="(item as Contact).id === activeChatId"
            @select="$emit('selectChat', (item as Contact).id)"
          />
        </template>
      </BVirtualVerticalList>

      <NoDataDisplay v-else-if="!isLoading" :text="t('noConversations')" />

      <div v-if="isLoadingMore" class="chat-list__loading">
        <span class="chat-list__spinner"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { t } from "../../../i18n";
import { useChatStore } from "../../../stores/chatStore";
import type { Contact, FilterKeys } from "../../../types";
import NoDataDisplay from "../../general/NoDataDisplay.vue";
import BLabel from "../../global/BLabel.vue";
import BVirtualVerticalList from "../../global/BVirtualVerticalList.vue";
import ChatContactDisplay from "./ChatContactDisplay.vue";
import ChatListSearch from "./ChatListSearch.vue";

defineProps<{
  activeChatId?: number | null;
}>();

defineEmits<{ selectChat: [id: number] }>();

const chatStore = useChatStore();

const searchQuery = ref("");
const activeFilter = ref<FilterKeys>("");

const filters = computed(() => [
  { key: "" as FilterKeys, label: t("all") },
  { key: "online" as FilterKeys, label: t("online") },
  { key: "active" as FilterKeys, label: t("active") },
  { key: "ended" as FilterKeys, label: t("ended") },
]);

const displayedContacts = computed(() =>
  chatStore.getDisplayedContacts(activeFilter.value),
);

const isLoading = computed(() => {
  const state = chatStore.conversationStates[activeFilter.value];
  return state.loading && state.page === 0;
});

const isLoadingMore = computed(() => {
  const state = chatStore.conversationStates[activeFilter.value];
  return state.loading && state.page > 0;
});

function setFilter(key: FilterKeys) {
  activeFilter.value = key;
  loadInitial();
}

function loadMore() {
  chatStore.loadNextPage(activeFilter.value);
}

function loadInitial() {
  chatStore.fetchConversations(activeFilter.value, 1, searchQuery.value);
}

let searchTimeout: ReturnType<typeof setTimeout>;
watch(searchQuery, (value) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    chatStore.fetchConversations(activeFilter.value, 1, value);
  }, 500);
});

onMounted(() => {
  loadInitial();
});
</script>

<style scoped>
.chat-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: var(--chat-sidebar-width);
  max-width: 100%;
  border-right: 1px solid var(--chat-border);
  background: var(--chat-bg);
}

[dir="rtl"] .chat-list {
  border-right: none;
  border-left: 1px solid var(--chat-border);
}

.chat-list__filters {
  display: flex;
  gap: var(--chat-spacing-xs);
  padding: 0 var(--chat-spacing-md) var(--chat-spacing-sm);
  overflow-x: auto;
}

.chat-list__content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.chat-list__loading {
  display: flex;
  justify-content: center;
  padding: var(--chat-spacing-md);
}

.chat-list__spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--chat-border);
  border-top-color: var(--chat-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
