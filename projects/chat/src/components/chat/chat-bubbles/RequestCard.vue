<template>
  <div class="request-card" :class="`request-card--${request.type}`">
    <div class="request-card__header">
      <BIcon :name="headerIcon" :size="20" />
      <span class="request-card__title">{{ headerTitle }}</span>
    </div>
    <div class="request-card__body">
      <slot />
    </div>
    <div v-if="showActions" class="request-card__actions">
      <BButton
        v-if="request.type === 'personal-info' && isPending"
        size="sm"
        color="success"
        :loading="isApproving"
        @click="$emit('approve')"
      >
        {{ t("approve") }}
      </BButton>
      <BButton
        v-if="request.type === 'personal-info' && isPending"
        size="sm"
        color="error"
        type="outline"
        :loading="isRejecting"
        @click="$emit('reject')"
      >
        {{ t("reject") }}
      </BButton>
    </div>
    <div v-if="statusText" class="request-card__status" :class="`request-card__status--${statusClass}`">
      {{ statusText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Request } from "../../../types";
import { t } from "../../../i18n";
import BIcon from "../../global/BIcon.vue";
import BButton from "../../global/BButton.vue";

const props = defineProps<{
  request: Request;
  isMine: boolean;
  isApproving?: boolean;
  isRejecting?: boolean;
}>();

defineEmits<{
  approve: [];
  reject: [];
}>();

const headerIcon = computed(() =>
  props.request.type === "personal-info" ? "user-circle" : "user-plus",
);

const headerTitle = computed(() =>
  props.request.type === "personal-info"
    ? t("personalInfoRequest")
    : t("addPersonRequest"),
);

const requestStatus = computed(() => {
  const req = props.request.request as any;
  return req?.status || "pending";
});

const isPending = computed(() => requestStatus.value === "pending" && !props.isMine);

const showActions = computed(() => isPending.value);

const statusText = computed(() => {
  const s = requestStatus.value;
  if (s === "approved") return t("approved");
  if (s === "rejected") return t("rejected");
  if (s === "pending") return t("pending");
  if (s === "searching") return t("searching");
  return "";
});

const statusClass = computed(() => {
  const s = requestStatus.value;
  if (s === "approved") return "success";
  if (s === "rejected") return "error";
  return "neutral";
});
</script>

<style scoped>
.request-card {
  border: 1px solid var(--chat-border);
  border-radius: var(--chat-radius-md);
  padding: var(--chat-spacing-md);
  min-width: 220px;
  max-width: 300px;
}

.request-card__header {
  display: flex;
  align-items: center;
  gap: var(--chat-spacing-sm);
  margin-bottom: var(--chat-spacing-sm);
  color: var(--chat-text);
  font-weight: 500;
}

.request-card__body {
  margin-bottom: var(--chat-spacing-sm);
}

.request-card__actions {
  display: flex;
  gap: var(--chat-spacing-sm);
  margin-top: var(--chat-spacing-sm);
}

.request-card__status {
  font-size: var(--chat-font-size-xs);
  padding: 2px 8px;
  border-radius: var(--chat-radius-full);
  display: inline-block;
  margin-top: var(--chat-spacing-sm);
}

.request-card__status--success { background: rgba(34, 197, 94, 0.1); color: var(--chat-success); }
.request-card__status--error { background: rgba(239, 68, 68, 0.1); color: var(--chat-error); }
.request-card__status--neutral { background: var(--chat-bg-tertiary); color: var(--chat-text-secondary); }
</style>
