<template>
  <div class="bubble-options" v-if="visible">
    <button
      v-for="option in availableOptions"
      :key="option.key"
      class="bubble-options__item"
      @click="$emit('action', option.key)"
    >
      <BIcon :name="option.icon" :size="18" />
      <span>{{ option.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import BIcon from "../../global/BIcon.vue";
import { t } from "../../../i18n";

const props = defineProps<{
  visible: boolean;
  isMine: boolean;
  canEdit: boolean;
  canDelete: boolean;
}>();

defineEmits<{ action: [key: string] }>();

const availableOptions = computed(() => {
  const options = [
    { key: "reply", icon: "arrow-bend-up-left", label: t("reply") },
    { key: "copy", icon: "copy", label: t("copy") },
    { key: "select", icon: "check-circle", label: t("select") },
  ];
  if (props.canEdit && props.isMine) {
    options.push({ key: "edit", icon: "pencil", label: t("edit") });
  }
  if (props.canDelete && props.isMine) {
    options.push({ key: "delete", icon: "trash", label: t("delete") });
  }
  return options;
});
</script>

<style scoped>
.bubble-options {
  position: absolute;
  top: -8px;
  background: var(--chat-surface);
  border: 1px solid var(--chat-border);
  border-radius: var(--chat-radius-md);
  box-shadow: var(--chat-shadow-md);
  display: flex;
  gap: 2px;
  padding: 4px;
  z-index: var(--chat-z-dropdown);
}

.bubble-options__item {
  display: flex;
  align-items: center;
  gap: var(--chat-spacing-xs);
  padding: 6px 10px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: var(--chat-radius-sm);
  font-size: var(--chat-font-size-sm);
  color: var(--chat-text-secondary);
  white-space: nowrap;
  transition: all var(--chat-transition-fast);
}

.bubble-options__item:hover {
  background: var(--chat-surface-hover);
  color: var(--chat-text);
}
</style>
