<template>
  <div class="chat-view" :class="{ 'chat-view--with-profile': showProfile }">
    <div class="chat-view__main">
      <ChatPageBar
        :contact="selectedContact"
        :show-back="showBack"
        @back="$emit('back')"
        @open-profile="showProfile = !showProfile"
        @call="$emit('call', $event)"
      >
        <template #menu>
          <MedicSelector @select="handleMedicAction" />
        </template>
      </ChatPageBar>

      <ChatMessages
        :messages="messages"
        :current-user-id="currentUserId"
        :contact-name="selectedContact?.name"
        :contact-image="selectedContact?.imageUrl"
        :is-loading="isLoadingMessages"
        @load-more="loadMoreMessages"
      />

      <ChatInput
        :conversation-id="chatId"
        :current-user-id="currentUserId"
        @open-attachment="showAttachment = true"
        @start-recording="recording.onPointerDown($event)"
        @move-recording="recording.onPointerMove($event)"
        @stop-recording="recording.onPointerUp()"
      />
    </div>

    <ChatProfileOverview
      :visible="showProfile"
      :contact="selectedContact"
      @close="showProfile = false"
    />

    <PatientReferral
      v-model="showReferral"
      @submit="handleReferral"
    />

    <PermissionPopup
      v-model="showPermission"
      permission-type="microphone"
      @allow="handlePermissionAllow"
      @deny="showPermission = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { Message, Contact } from "../../types";
import { useChatStore } from "../../stores/chatStore";
import { useChatActionStore } from "../../stores/chatActionStore";
import { useChatRecording } from "../../composables/useChatRecording";
import { useAppPermissions } from "../../composables/useAppPermissions";
import ChatPageBar from "./ChatPageBar.vue";
import ChatMessages from "./ChatMessages.vue";
import ChatInput from "./ChatInput.vue";
import ChatProfileOverview from "./ChatProfileOverview.vue";
import PatientReferral from "./PatientReferral.vue";
import { MedicSelector } from "./medic-features";
import { PermissionPopup } from "./chat-input";

const props = defineProps<{
  chatId: number;
  currentUserId: number;
  messages?: Message[];
  showBack?: boolean;
}>();

const emit = defineEmits<{
  back: [];
  call: [type: "voice" | "video"];
}>();

const chatStore = useChatStore();
const actionStore = useChatActionStore();
const permissions = useAppPermissions();

const messages = ref<Message[]>([]);
const isLoadingMessages = ref(false);
const showProfile = ref(false);
const showAttachment = ref(false);
const showReferral = ref(false);
const showPermission = ref(false);

const selectedContact = computed<Contact | null>(() =>
  chatStore.getContactById(props.chatId),
);

const recording = useChatRecording({
  onStart: () => {},
  onCancel: () => {},
  onSend: (url) => {
    const msg: Message = {
      id: 0,
      conversationId: props.chatId,
      date: new Date(),
      type: "voice",
      voiceUrl: url,
      senderId: props.currentUserId,
      isSent: false,
      isRead: false,
      isEdited: false,
      repliedTo: null,
    };
    actionStore.sendMessage([msg]);
  },
  requestPermission: async () => {
    const has = await permissions.checkPermission("microphone");
    if (has) return true;
    showPermission.value = true;
    return false;
  },
});

function handlePermissionAllow() {
  permissions.requestPermission("microphone");
}

function loadMoreMessages() {
  // Consumers handle this via the adapter
}

function handleMedicAction(key: string) {
  switch (key) {
    case "prescription":
      actionStore.triggerPrescription(props.chatId);
      break;
    case "add-person":
      actionStore.triggerPersonalInfoRequest(props.chatId);
      break;
    case "referral":
      showReferral.value = true;
      break;
  }
}

function handleReferral(_data: any) {
  // Consumers handle this via adapter/events
}

watch(
  () => props.messages,
  (newMsgs) => {
    if (newMsgs) messages.value = newMsgs;
  },
  { immediate: true },
);

onMounted(() => {
  chatStore.activeConversationId = props.chatId;
  chatStore.markAsRead(props.chatId);
});
</script>

<style scoped>
.chat-view {
  display: flex;
  height: 100%;
  width: 100%;
}

.chat-view__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
}

.chat-view--with-profile .chat-view__main {
  flex: 1;
}
</style>
