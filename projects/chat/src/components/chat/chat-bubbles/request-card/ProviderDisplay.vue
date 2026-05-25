<template>
  <div class="provider-display">
    <ContactAvatar
      :image-url="provider.imageUrl"
      :name="provider.name"
      :last-name="provider.lastName"
      size="sm"
      :show-online="false"
    />
    <div class="provider-display__info">
      <span class="provider-display__name">{{ provider.name }} {{ provider.lastName }}</span>
      <span v-if="provider.fellowship" class="provider-display__fellowship">
        {{ provider.fellowship.label }}
      </span>
    </div>
    <span v-if="provider.price" class="provider-display__price">
      {{ formatCurrency(provider.price) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import type { RequestProvider } from "../../../../types";
import { formatCurrency } from "../../../../utils/format";
import ContactAvatar from "../../contact/ContactAvatar.vue";

defineProps<{
  provider: RequestProvider;
}>();
</script>

<style scoped>
.provider-display {
  display: flex;
  align-items: center;
  gap: var(--chat-spacing-sm);
  padding: var(--chat-spacing-xs) 0;
}

.provider-display__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.provider-display__name {
  font-size: var(--chat-font-size-sm);
  font-weight: 500;
  color: var(--chat-text);
}

.provider-display__fellowship {
  font-size: var(--chat-font-size-xs);
  color: var(--chat-text-secondary);
}

.provider-display__price {
  font-size: var(--chat-font-size-sm);
  color: var(--chat-primary);
  font-weight: 500;
}
</style>
