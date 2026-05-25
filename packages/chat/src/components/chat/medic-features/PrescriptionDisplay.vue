<template>
  <BPopup v-model="isOpen" :title="t('prescription')" fullscreen>
    <div class="prescription">
      <slot />
    </div>
  </BPopup>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { t } from "../../../i18n";
import BPopup from "../../global/BPopup.vue";

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});
</script>

<style scoped>
.prescription {
  padding: var(--chat-spacing-md);
}
</style>
