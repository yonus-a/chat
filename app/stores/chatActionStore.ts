import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useProfileStore, useDate, useI18n, useAppToast } from "#imports";
import type { ExtendedMessage, Message } from "~/types/chat";
import { useEventBus } from "@vueuse/core";
import { useChatStore } from "~/stores/chatStore";

export const useChatActionStore = defineStore("chatAction", () => {
  const profileStore = useProfileStore();
  const { t } = useI18n();
  const { openToast } = useAppToast();
  const { formatDateShort, formatTime } = useDate();
  const chatStore = useChatStore();
  const uploadProgress = ref<
    Map<number, { progress: number; uploaded: number; total: number }>
  >(new Map());

  // --- State ---
  const isSelectMode = ref(false);
  const selectedMessages = ref<Map<number, ExtendedMessage>>(new Map());
  const isMenuOpen = ref(false);
  const replyingTo = ref<ExtendedMessage | null>(null);
  const editingMessage = ref<ExtendedMessage | null>(null);
  const editWindowHours = ref(6);

  // --- Event Buses ---
  const deleteBus = useEventBus<number[]>("chat-delete");
  const sendBus = useEventBus<Message[]>("chat-send");
  const editBus = useEventBus<ExtendedMessage>("edit-message");
  // NEW: A unified bus to patch existing messages (handling ID swaps, isSent toggles, etc.)
  const updateBus = useEventBus<{ id: number; updates: Partial<Message> }>(
    "chat-update",
  );

  // --- Getters ---
  const selectedArray = computed(() =>
    Array.from(selectedMessages.value.values()),
  );
  const canReply = computed(() => selectedMessages.value.size <= 1);
  const canEdit = computed(() => {
    if (selectedMessages.value.size !== 1) return false;
    const msg = selectedArray.value[0];
    if (!msg) return false;
    const isMine = msg.senderId === profileStore.userData.id;
    const hoursPassed =
      (Date.now() - new Date(msg.date).getTime()) / (1000 * 60 * 60);
    return isMine && hoursPassed < editWindowHours.value;
  });
  const canDelete = computed(() => {
    if (selectedMessages.value.size === 0) return false;
    return selectedArray.value.every((msg) => {
      const isMine = msg.senderId === profileStore.userData.id;
      const hoursPassed =
        (Date.now() - new Date(msg.date).getTime()) / (1000 * 60 * 60);
      return isMine && hoursPassed < editWindowHours.value;
    });
  });

  // --- Actions (Optimistic UI + Mock APIs) ---

  const triggerDelete = async (specificIds?: number[]) => {
    const targets = specificIds?.length
      ? specificIds
      : selectedArray.value.map((m) => m.id);
    if (targets.length === 0) return;

    // 1. Instantly trigger the delete animation in the UI
    deleteBus.emit(targets);
    clearActions();

    // 2. Background API Call (Mocked)
    // Even if it takes 2 seconds, the UI is already clean.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("API: Messages deleted successfully on server.");
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

    // Process mock uploads for each message
    for (const tempMsg of tempMessages) {
      // Mock File Sizes based on attachment type
      let totalSize = 1024 * 1024 * 2; // Default 2MB
      if (tempMsg.type === "video") totalSize = 1024 * 1024 * 15; // 15MB
      if (tempMsg.type === "file") totalSize = 1024 * 1024 * 5; // 5MB

      // Initialize progress
      if (tempMsg.type !== "text") {
        uploadProgress.value.set(tempMsg.id, {
          progress: 0,
          uploaded: 0,
          total: totalSize,
        });
      }

      // Mock chunked uploading taking 2.5 seconds total (250ms interval * 10)
      let currentBytes = 0;
      const interval = setInterval(async () => {
        currentBytes += totalSize / 10;

        if (currentBytes >= totalSize) {
          clearInterval(interval);
          uploadProgress.value.delete(tempMsg.id);

          const realId = Math.floor(Math.random() * 100000) + 1000;

          // Mock Caching to IDB to ensure instant availability without downloading
          try {
            const dbName = "ChatFileCache";
            const db = await new Promise<IDBDatabase>((res, rej) => {
              const req = indexedDB.open(dbName, 1);
              req.onupgradeneeded = () => req.result.createObjectStore("files");
              req.onsuccess = () => res(req.result);
              req.onerror = () => rej(req.error);
            });
            const tx = db.transaction("files", "readwrite");
            const mockBlob = new Blob(["mock content"], {
              type: "application/octet-stream",
            });

            // Cache against every URL found in the message
            const urlsToCache = [
              tempMsg.fileUrl,
              tempMsg.voiceUrl,
              tempMsg.videoUrl,
              ...(tempMsg.imageUrl || []),
            ].filter(Boolean) as string[];
            urlsToCache.forEach((url) =>
              tx.objectStore("files").put(mockBlob, url),
            );
          } catch (e) {
            console.warn("Failed to mock cache", e);
          }

          // Commit to UI
          updateBus.emit({
            id: tempMsg.id,
            updates: { id: realId, isSent: true },
          });
          chatStore.patchLastMessage(tempMsg.conversationId, tempMsg.id, {
            id: realId,
            isSent: true,
          });
        } else {
          uploadProgress.value.set(tempMsg.id, {
            progress: Math.round((currentBytes / totalSize) * 100),
            uploaded: currentBytes,
            total: totalSize,
          });
        }
      }, 250);
    }
  };

  const saveEditMessage = async (id: number, text: string) => {
    const conversationId = editingMessage.value?.conversationId;

    // 1. Optimistic update
    updateBus.emit({ id, updates: { text, isSent: false } });
    if (conversationId)
      chatStore.patchLastMessage(conversationId, id, { text, isSent: false });

    clearActions();

    // 2. Mock API Call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 3. Confirm edit
    updateBus.emit({ id, updates: { isSent: true, isEdited: true } });
    if (conversationId)
      chatStore.patchLastMessage(conversationId, id, {
        isSent: true,
        isEdited: true,
      });
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
    const newMap = new Map();
    newMap.set(message.id, message);
    selectedMessages.value = newMap;
  };

  const clearActions = () => {
    isSelectMode.value = false;
    selectedMessages.value.clear();
    replyingTo.value = null;
    editingMessage.value = null;
  };

  const copyMessageText = () => {
    const textToCopy = selectedArray.value
      .map((msg) => {
        const isMine = msg.senderId === profileStore.userData.id;
        const senderName = isMine ? t("chat.you") : msg.contact?.name || "User";
        const dateTime = `${formatDateShort(msg.date)}, ${formatTime(msg.date)}`;
        const content =
          msg.text ||
          (msg.imageUrl ? "[Image]" : msg.voiceUrl ? "[Voice]" : "[File]");
        return `${senderName} [${dateTime}]:\n${content}`;
      })
      .join("\n\n");

    navigator.clipboard.writeText(textToCopy).then(() => {
      openToast(t("chat.copiedMessage"), "success");
    });
    clearActions();
  };

  return {
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
    updateBus, // Exposed buses
    triggerDelete,
    sendMessage,
    saveEditMessage,
    triggerEdit, // API wrappers
    toggleSelection,
    startSelectMode,
    clearActions,
    copyMessageText,
    editBus,
    uploadProgress,
  };
});
