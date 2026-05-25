<template>
  <RequestCard
    v-if="message.request"
    :request="message.request"
    :is-mine="isMine"
    :is-approving="isApproving"
    :is-rejecting="isRejecting"
    @approve="$emit('approve')"
    @reject="$emit('reject')"
  />
</template>

<script setup lang="ts">
import type { ExtendedMessage } from "../../../types";
import RequestCard from "./RequestCard.vue";

defineProps<{
  message: ExtendedMessage;
  isMine: boolean;
  isApproving?: boolean;
  isRejecting?: boolean;
}>();

defineEmits<{
  approve: [];
  reject: [];
}>();
</script>
