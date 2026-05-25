<template>
  <BModal v-model="isOpen" :title="t('permissionRequired')" size="sm">
    <div class="permission-popup">
      <p class="permission-popup__text">{{ permissionMessage }}</p>
      <div class="permission-popup__actions">
        <BButton color="neutral" @click="deny">{{ t("deny") }}</BButton>
        <BButton @click="allow">{{ t("allow") }}</BButton>
      </div>
    </div>
  </BModal>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { t } from "../../../i18n";
import BModal from "../../global/BModal.vue";
import BButton from "../../global/BButton.vue";

const props = defineProps<{
  modelValue: boolean;
  permissionType: "microphone" | "camera" | "screen";
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  allow: [];
  deny: [];
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

const permissionMessage = computed(() => {
  switch (props.permissionType) {
    case "microphone":
      return t("micPermissionMessage");
    case "camera":
      return t("cameraPermissionMessage");
    case "screen":
      return t("screenPermissionMessage");
    default:
      return "";
  }
});

function allow() {
  emit("allow");
  emit("update:modelValue", false);
}

function deny() {
  emit("deny");
  emit("update:modelValue", false);
}
</script>

<style scoped>
.permission-popup {
  text-align: center;
}

.permission-popup__text {
  color: var(--chat-text-secondary);
  font-size: var(--chat-font-size-md);
  margin-bottom: var(--chat-spacing-lg);
}

.permission-popup__actions {
  display: flex;
  gap: var(--chat-spacing-sm);
  justify-content: center;
}
</style>
