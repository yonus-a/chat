<template>
  <div class="bg-surface w-dvw h-dvh overflow-hidden flex">
    <div class="flex-1 h-full max-h-full flex flex-col min-w-0">
      <div ref="pageContainer" class="flex-1 w-full overflow-y-auto">
        <div class="flex w-full h-full max-h-full overflow-hidden">
          <!-- Messaging section -->
          <div
            v-if="showMessagingSection"
            class="h-full flex-1 relative bg-surface-variant"
          >
            <div
              v-show="canShowMessagingSection || isProfile"
              class="h-full w-full flex"
            >
              <ChatProfileOverview
                :profile="selectedChat"
                :is-open="isProfile"
                @close="closeProfile"
              />

              <div
                v-show="chatId && isChatMode"
                class="flex flex-1 flex-col justify-between items-center h-full"
              >
                <div class="w-full bg-surface h-16 md:h-20">
                  <ChatPageBar
                    :options="medicOptions"
                    :contact="selectedChat"
                    :conversation-id="chatId"
                    @open-profile="openProfile"
                    @go-back="closeConversation"
                  />
                </div>

                <div class="flex-1 w-full min-h-0 overflow-hidden">
                  <ChatMessages
                    v-show="selectedChat"
                    :options="medicOptions"
                    :contact="selectedChat"
                    :conversation-id="chatId ?? undefined"
                  />
                </div>

                <ChatInput
                  ref="chatInput"
                  :is-active="selectedChat?.isActive"
                  :conversation-id="chatId ?? undefined"
                />
              </div>

              <div
                v-show="!chatId"
                class="w-full h-full flex items-center justify-center"
              >
                <NoDataDisplay
                  :image-path="NoChatSelected"
                  :title="t('chat.noConversationSelected')"
                />
              </div>
            </div>

            <div
              v-show="!canShowMessagingSection && !isProfile"
              class="w-full h-full flex items-center justify-center"
            >
              <NoDataDisplay
                :image-path="NoChatSelected"
                :title="t('chat.noConversationSelected')"
              />
            </div>

            <CallPageOverlay
              v-show="isCallMode && selectedChat"
              :contact="selectedChat"
            />
            <PatientReferral
              v-if="selectedChat"
              ref="patientRefferal"
              :contact="selectedChat"
            />
            <PermissionPopup />
          </div>

          <!-- Contact list sidebar -->
          <div
            v-if="showContactList"
            class="md:w-80 w-full h-full shrink-0 border-l border-outline-variant"
          >
            <ChatList />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  ref,
  useTemplateRef,
  watch,
} from "vue";
import { useI18n, useWindowSize, useChatStore, useCallStore } from "#imports";
import ChatPageBar from "~/components/chat/ChatPageBar.vue";
import ChatInput from "~/components/chat/ChatInput.vue";
import ChatProfileOverview from "~/components/chat/ChatProfileOverview.vue";
import ChatMessages from "~/components/chat/ChatMessages.vue";
import ChatList from "~/components/chat/contact/ChatList.vue";
import NoDataDisplay from "~/components/general/NoDataDisplay.vue";
import PatientReferral from "~/components/chat/PatientReferral.vue";
import type { PatientRefferalExposed } from "~/components/chat/PatientReferral.vue";
import CallPageOverlay from "~/components/call/CallPageOverlay.vue";
import PermissionPopup from "~/components/chat/chat-input/PermissionPopup.vue";
import { type ChatTextField } from "~/types/components/chat-input";
import { type MenuOption } from "~/types/components/menu-options";
import NoChatSelected from "/images/chat/no-chat-selected.webp";

export default defineComponent({
  name: "Chat",
  components: {
    CallPageOverlay,
    ChatInput,
    ChatList,
    ChatMessages,
    ChatPageBar,
    ChatProfileOverview,
    NoDataDisplay,
    PatientReferral,
    PermissionPopup,
  },
  setup() {
    const chatStore = useChatStore();
    const callStore = useCallStore();
    const { t } = useI18n();
    const { width } = useWindowSize();

    const chatInput = ref<ChatTextField | null>(null);
    useTemplateRef<PatientRefferalExposed>("patientRefferal");

    const isMobile = computed(() => width.value < 768);
    const chatId = computed(() => chatStore.activeConversationId);
    const isInChat = computed(() => chatStore.activeConversationId !== null);
    const isCallMode = computed(() => callStore.isActive && !callStore.isPiP);
    const isProfile = computed(() => chatStore.isProfileOpen);

    const showContactList = computed(() => {
      if (isMobile.value) {
        return !isInChat.value;
      }
      return true;
    });

    const showMessagingSection = computed(() => {
      if (isMobile.value) {
        return isInChat.value;
      }
      return true;
    });

    const canShowMessagingSection = computed(() => {
      if (isCallMode.value) {
        return false;
      }

      if (isMobile.value) {
        return !isProfile.value;
      }

      return true;
    });

    const isChatMode = computed(() => {
      if (isMobile.value) {
        return !isProfile.value;
      }

      return canShowMessagingSection.value;
    });

    const selectedChat = computed(() => {
      if (!chatId.value) {
        return null;
      }

      return chatStore.getContactById(chatId.value);
    });

    watch(
      () => chatStore.activeConversationId,
      () => {
        if (chatId.value && selectedChat.value?.isActive) {
          nextTick(() => {
            chatInput.value?.focus();
          });
        }
      },
    );

    const openProfile = () => {
      chatStore.openProfile();
    };

    const closeProfile = () => {
      chatStore.closeProfile();
    };

    const closeConversation = () => {
      chatStore.closeProfile();
      chatStore.setActiveConversation(null);
    };

    const medicOptions = computed<MenuOption[]>(() => [
      {
        label: t("chat.barOptions.prescribeMedications"),
        icon: "PhPencilSimpleLine",
        key: "prescribe-meds",
      },
      {
        label: t("chat.barOptions.addPerson"),
        icon: "PhUserPlus",
        key: "add-user",
      },
      {
        label: t("chat.barOptions.refer"),
        icon: "PhTreeStructure",
        key: "refer",
      },
      {
        label: t("chat.barOptions.endChat"),
        icon: "PhXSquare",
        key: "end-chat",
      },
      {
        label: t("chat.barOptions.deleteMessages"),
        icon: "PhTrash",
        key: "delete-all",
        color: "error",
      },
    ]);

    return {
      NoChatSelected,
      canShowMessagingSection,
      chatId,
      chatInput,
      isCallMode,
      isChatMode,
      isProfile,
      medicOptions,
      closeProfile,
      closeConversation,
      openProfile,
      selectedChat,
      showContactList,
      showMessagingSection,
      t,
    };
  },
});
</script>
