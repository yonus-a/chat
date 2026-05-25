<template>
  <BMenu position="bottom-end">
    <template #trigger>
      <slot name="trigger">
        <button class="medic-selector__trigger">
          <BIcon name="plus-circle" :size="20" />
        </button>
      </slot>
    </template>
    <div class="medic-selector__content">
      <button
        v-for="option in options"
        :key="option.key"
        class="medic-selector__item"
        @click="$emit('select', option.key)"
      >
        <BIcon :name="option.icon" :size="18" />
        <span>{{ option.label }}</span>
      </button>
    </div>
  </BMenu>
</template>

<script setup lang="ts">
import BIcon from "../../global/BIcon.vue";
import BMenu from "../../global/BMenu.vue";
import { t } from "../../../i18n";

defineEmits<{ select: [key: string] }>();

const options = [
  { key: "prescription", icon: "prescription", label: t("prescription") },
  { key: "add-person", icon: "user-plus", label: t("addPerson") },
  { key: "referral", icon: "arrow-square-out", label: t("referPatient") },
  { key: "end-chat", icon: "sign-out", label: t("endChat") },
];
</script>

<style scoped>
.medic-selector__trigger {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--chat-text-secondary);
  padding: var(--chat-spacing-xs);
  display: flex;
}

.medic-selector__content {
  display: flex;
  flex-direction: column;
  min-width: 180px;
}

.medic-selector__item {
  display: flex;
  align-items: center;
  gap: var(--chat-spacing-sm);
  padding: var(--chat-spacing-sm) var(--chat-spacing-md);
  border: none;
  background: none;
  cursor: pointer;
  font-size: var(--chat-font-size-md);
  color: var(--chat-text);
  border-radius: var(--chat-radius-sm);
  transition: background var(--chat-transition-fast);
  width: 100%;
  text-align: start;
}

.medic-selector__item:hover {
  background: var(--chat-surface-hover);
}
</style>
