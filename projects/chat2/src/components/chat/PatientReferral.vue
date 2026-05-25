<template>
  <BPopup v-model="isOpen" :title="t('referPatient')">
    <div class="patient-referral">
      <div class="patient-referral__field">
        <label>{{ t("specialty") }}</label>
        <input v-model="specialty" class="patient-referral__input" />
      </div>
      <div class="patient-referral__field">
        <label>{{ t("priority") }}</label>
        <select v-model="priority" class="patient-referral__input">
          <option value="normal">{{ t("normal") }}</option>
          <option value="urgent">{{ t("urgent") }}</option>
          <option value="emergency">{{ t("emergency") }}</option>
        </select>
      </div>
      <div class="patient-referral__field">
        <label>{{ t("description") }}</label>
        <textarea v-model="description" class="patient-referral__textarea" rows="4"></textarea>
      </div>
      <BButton @click="submit" :disabled="!specialty">
        {{ t("submit") }}
      </BButton>
    </div>
  </BPopup>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { t } from "../../i18n";
import BPopup from "../global/BPopup.vue";
import BButton from "../global/BButton.vue";

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submit: [data: { specialty: string; priority: string; description: string }];
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

const specialty = ref("");
const priority = ref("normal");
const description = ref("");

function submit() {
  emit("submit", {
    specialty: specialty.value,
    priority: priority.value,
    description: description.value,
  });
  emit("update:modelValue", false);
  specialty.value = "";
  priority.value = "normal";
  description.value = "";
}
</script>

<style scoped>
.patient-referral {
  display: flex;
  flex-direction: column;
  gap: var(--chat-spacing-md);
}

.patient-referral__field {
  display: flex;
  flex-direction: column;
  gap: var(--chat-spacing-xs);
}

.patient-referral__field label {
  font-size: var(--chat-font-size-sm);
  color: var(--chat-text-secondary);
  font-weight: 500;
}

.patient-referral__input,
.patient-referral__textarea {
  padding: var(--chat-spacing-sm) var(--chat-spacing-md);
  border: 1px solid var(--chat-border);
  border-radius: var(--chat-radius-md);
  font-family: var(--chat-font-family);
  font-size: var(--chat-font-size-md);
  color: var(--chat-text);
  background: var(--chat-bg);
  outline: none;
}

.patient-referral__input:focus,
.patient-referral__textarea:focus {
  border-color: var(--chat-primary);
}

.patient-referral__textarea {
  resize: vertical;
}
</style>
