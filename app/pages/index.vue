<template>
  <ChatDashboard />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ChatDashboard from '~/components/chat/ChatDashboard.vue';

definePageMeta({
  layout: 'chat',
});

export default defineComponent({
  name: 'IndexPage',
  components: {
    ChatDashboard,
  },
});
</script>
