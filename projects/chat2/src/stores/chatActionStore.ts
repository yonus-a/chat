import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { ExtendedMessage, Message, UploadProgress } from "../types";
import type { ChatDataAdapter } from "../adapter/types";
import { useChatStore } from "./chatStore";
import { useDate } from "../composables/useDate";
import { useAppToast } from "../composables/useAppToast";
import { t } from "../i18n";

// Simple event bus implementation
type EventHandler<T> = (payload: T) => void;

class EventBus<T> {
  private handlers: EventHandler<T>[] = [];

  on(handler: EventHandler<T>) {
    this.handlers.push(handler);
    return () => this.off(handler);
  }

  off(handler: EventHandler<T>) {
    this.handlers = this.handlers.filter((h) => h !== handler);
  }

  emit(payload: T) {
    this.handlers.forEach((h) => h(payload));
  }
}

export const useChatActionStore = defineStore("behayand-chat-action", () => {
  // Adapter reference
  let adapter: ChatDataAdapter | null = null;
  let currentUserId: number = 0;

  function setAdapter(a: ChatDataAdapter) {
    adapter = a;
    currentUserId = a.getCurrentUserId();
  }

  function getAdapter(): ChatDataAdapter {
    if (!adapter) {
      throw new Error(
        "[@behayand/chat] No adapter set on action store.",
      );
    }
    return adapter;
  }

  const { formatDateShort, formatTime } = useDate();
  const { openToast } = useAppToast();
  const chatStore = useChatStore();

  const uploadProgress = ref<Map<number, UploadProgress>>(new Map());
  const processingActions = ref(new Map<number, string>());

  const isActionBusy = (messageId: number, actionKey: string) => {
    return processingActions.value.get(messageId) === actionKey;
  };

  // --- State ---
  const isSelectMode = ref(false);
  const selectedMessages = ref<Map<number, ExtendedMessage>>(new Map());
  const isMenuOpen = ref(false);
  const replyingTo = ref<ExtendedMessage | null>(null);
  const editingMessage = ref<ExtendedMessage | null>(null);
  const editWindowHours = ref(6);

  // --- Event Buses ---
  const deleteBus = new EventBus<number[]>();
  const sendBus = new EventBus<Message[]>();
  const editBus = new EventBus<ExtendedMessage>();
  const personalInfoBus = new EventBus<number>();
  const prescriptionBus = new EventBus<number>();
  const updateBus = new EventBus<{ id: number; updates: Partial<Message> }>();

  const triggerPersonalInfoRequest = (conversationId: number) => {
    personalInfoBus.emit(conversationId);
  };

  const triggerPrescription = (conversationId: number) => {
    prescriptionBus.emit(conversationId);
  };

  // --- Getters ---
  const selectedArray = computed(() =>
    Array.from(selectedMessages.value.values()),
  );
  const canReply = computed(() => selectedMessages.value.size <= 1);
  const canEdit = computed(() => {
    if (selectedMessages.value.size !== 1) return false;
    const msg = selectedArray.value[0];
    if (!msg) return false;
    const isMine = msg.senderId === currentUserId;
    const hoursPassed =
      (Date.now() - new Date(msg.date).getTime()) / (1000 * 60 * 60);
    return isMine && hoursPassed < editWindowHours.value;
  });
  const canDelete = computed(() => {
    if (selectedMessages.value.size === 0) return false;
    return selectedArray.value.every((msg) => {
      const isMine = msg.senderId === currentUserId;
      const hoursPassed =
        (Date.now() - new Date(msg.date).getTime()) / (1000 * 60 * 60);
      return isMine && hoursPassed < editWindowHours.value;
    });
  });

  // --- Actions ---
  const triggerDelete = async (specificIds?: number[]) => {
    const targets = specificIds?.length
      ? specificIds
      : selectedArray.value.map((m) => m.id);
    if (targets.length === 0) return;

    targets.forEach((id) => processingActions.value.set(id, "cancel-request"));
    deleteBus.emit(targets);
    clearActions();

    try {
      await getAdapter().deleteMessages(targets);
    } finally {
      targets.forEach((id) => processingActions.value.delete(id));
    }
  };

  const handleRemoteAction = async (
    messageId: number,
    actionKey: string,
    apiCall: () => Promise<void>,
  ) => {
    processingActions.value.set(messageId, actionKey);
    try {
      await apiCall();
    } finally {
      processingActions.value.delete(messageId);
    }
  };

  const sendMessage = async (messages: Message[]) => {
    const tempMessages = messages.map((m) => ({
      ...m,
      id: Math.floor(Math.random() * -1000000),
      isSent: false,
    }));

    sendBus.emit(tempMessages);

    if (tempMessages.length > 0) {
      const latest = tempMessages[tempMessages.length - 1];
      chatStore.updateLastMessage(latest.conversationId, latest);
    }

    // Send via adapter
    try {
      const confirmedMessages = await getAdapter().sendMessage(tempMessages);

      // Update temp messages with real IDs
      for (let i = 0; i < tempMessages.length; i++) {
        const confirmed = confirmedMessages[i];
        if (confirmed) {
          updateBus.emit({
            id: tempMessages[i].id,
            updates: { id: confirmed.id, isSent: true },
          });
          chatStore.patchLastMessage(
            tempMessages[i].conversationId,
            tempMessages[i].id,
            { id: confirmed.id, isSent: true },
          );
        }
      }
    } catch (error) {
      console.error("[@behayand/chat] Failed to send message:", error);
    }
  };

  const saveEditMessage = async (id: number, text: string) => {
    const conversationId = editingMessage.value?.conversationId;

    // Optimistic update
    updateBus.emit({ id, updates: { text, isSent: false } });
    if (conversationId)
      chatStore.patchLastMessage(conversationId, id, { text, isSent: false });

    clearActions();

    try {
      await getAdapter().editMessage(id, text);
      updateBus.emit({ id, updates: { isSent: true, isEdited: true } });
      if (conversationId)
        chatStore.patchLastMessage(conversationId, id, {
          isSent: true,
          isEdited: true,
        });
    } catch (error) {
      console.error("[@behayand/chat] Failed to edit message:", error);
    }
  };

  const triggerEdit = (message: ExtendedMessage) => {
    editingMessage.value = message;
    editBus.emit(editingMessage.value);
  };

  const toggleSelection = (message: ExtendedMessage) => {
    const newMap = new Map(selectedMessages.value);
    if (newMap.has(message.id)) {
      newMap.delete(message.id);
      if (newMap.size === 0) isSelectMode.value = false;
    } else {
      newMap.set(message.id, message);
    }
    selectedMessages.value = newMap;
  };

  const startSelectMode = (message: ExtendedMessage) => {
    isSelectMode.value = true;
    const newMap = new Map<number, ExtendedMessage>();
    newMap.set(message.id, message);
    selectedMessages.value = newMap;
  };

  const clearActions = () => {
    isSelectMode.value = false;
    selectedMessages.value = new Map();
    replyingTo.value = null;
    editingMessage.value = null;
  };

  const copyMessageText = () => {
    const textToCopy = selectedArray.value
      .map((msg) => {
        const isMine = msg.senderId === currentUserId;
        const senderName = isMine
          ? t("you")
          : msg.contact?.name || "User";
        const dateTime = `${formatDateShort(msg.date)}, ${formatTime(msg.date)}`;
        const content =
          msg.text ||
          (msg.imageUrl ? "[Image]" : msg.voiceUrl ? "[Voice]" : "[File]");
        return `${senderName} [${dateTime}]:\n${content}`;
      })
      .join("\n\n");

    navigator.clipboard.writeText(textToCopy).then(() => {
      openToast(t("copiedMessage"), "success");
    });
    clearActions();
  };

  const sendServiceRequest = async (
    conversationId: number,
    serviceId: number,
    serviceLabel: string,
    selectedProviders: any[],
  ) => {
    if (getAdapter().sendServiceRequest) {
      const msg = await getAdapter().sendServiceRequest!({
        conversationId,
        serviceId,
        serviceLabel,
        providers: selectedProviders,
      });
      if (msg) {
        sendBus.emit([msg]);
        chatStore.updateLastMessage(conversationId, msg);
      }
    }
  };

  const sendPersonalInfoRequest = async (conversationId: number) => {
    if (getAdapter().sendPersonalInfoRequest) {
      const msg = await getAdapter().sendPersonalInfoRequest!(conversationId);
      if (msg) {
        sendBus.emit([msg]);
        chatStore.updateLastMessage(conversationId, msg);
      }
    }
  };

  const handleAccessResponse = async (
    messageId: number,
    conversationId: number,
    key: "confirm-access" | "reject-access",
    currentRequest: any,
  ) => {
    processingActions.value.set(messageId, key);

    try {
      const targetStatus = key === "confirm-access" ? "approved" : "rejected";

      if (getAdapter().handleAccessResponse) {
        await getAdapter().handleAccessResponse!({
          messageId,
          conversationId,
          action: key === "confirm-access" ? "approve" : "reject",
        });
      }

      const updatedRequest = {
        ...currentRequest,
        request: {
          ...currentRequest.request,
          status: targetStatus,
        },
      };

      updateBus.emit({ id: messageId, updates: { request: updatedRequest } });
      chatStore.patchLastMessage(conversationId, messageId, {
        request: updatedRequest,
      });
    } catch (error) {
      console.error("[@behayand/chat] Action failed:", error);
    } finally {
      processingActions.value.delete(messageId);
    }
  };

  return {
    setAdapter,
    isSelectMode,
    selectedMessages,
    isMenuOpen,
    replyingTo,
    editingMessage,
    editWindowHours,
    selectedArray,
    canReply,
    canEdit,
    canDelete,
    deleteBus,
    sendBus,
    updateBus,
    triggerDelete,
    sendMessage,
    saveEditMessage,
    triggerEdit,
    toggleSelection,
    startSelectMode,
    clearActions,
    copyMessageText,
    editBus,
    uploadProgress,
    triggerPersonalInfoRequest,
    sendServiceRequest,
    prescriptionBus,
    sendPersonalInfoRequest,
    triggerPrescription,
    personalInfoBus,
    processingActions,
    isActionBusy,
    handleRemoteAction,
    handleAccessResponse,
  };
});
