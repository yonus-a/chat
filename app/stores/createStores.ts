import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useEventBus } from "@vueuse/core";
import type {
  Message,
  Contact,
  ExtendedMessage,
  FilterKeys,
  UserRoleKey,
  RequestProvider,
  ServiceRequest,
  AccessRequest,
} from "~/types/chat";
import type { Provider, Service } from "~/types/service";
import type { Medication } from "~/types/medication";
import type { DropdownOption } from "~/types/components/select";
import type { HostAdapter } from "~/adapter";
import { useDate, useI18n, useAppToast } from "#imports";
import { useWindowSize } from "~/composables/useWindowSize";

export interface CreateStoresOptions {
  adapter: HostAdapter;
}

export type AppStores = ReturnType<typeof createStores>;

export const createStores = ({ adapter }: CreateStoresOptions) => {
  const useChatStore = defineStore("chat", () => {
    const { height: windowHeight } = useWindowSize();

    const chatsPerPage = computed(() => {
      const h = windowHeight.value || 800;
      return Math.floor((h - 138) / 76) + 1;
    });

    const currentUserId = ref(1);
    const chosenRole = ref<UserRoleKey>("user");
    const currentUserBirthDate = ref<Date | null>(
      new Date("1999-11-25T00:00:00Z"),
    );
    const activeConversationId = ref<number | null>(null);
    const profileViewOpen = ref(false);
    const messagesMap = ref<Record<number, Message[]>>({});

    const conversationStates = ref<
      Record<
        FilterKeys,
        {
          data: Contact[];
          loading: boolean;
          page: number;
          hasNextPage: boolean;
        }
      >
    >({
      "": { data: [], loading: false, page: 0, hasNextPage: true },
      online: { data: [], loading: false, page: 0, hasNextPage: true },
      ended: { data: [], loading: false, page: 0, hasNextPage: true },
      active: { data: [], loading: false, page: 0, hasNextPage: true },
    });

    const setSelectedChat = (id: number | null) => {
      activeConversationId.value = id;
      profileViewOpen.value = false;
    };

    const openProfile = () => {
      profileViewOpen.value = true;
    };

    const closeProfile = () => {
      profileViewOpen.value = false;
    };

    const fetchConversations = async (
      filter: FilterKeys = "",
      page = 1,
      search = "",
    ) => {
      const state = conversationStates.value[filter];
      if (state.loading) return;
      state.loading = true;
      try {
        const result = await adapter.chat.fetchContacts({
          filter,
          page,
          pageSize: chatsPerPage.value,
          search,
        });
        state.data =
          page === 1 ? result.data : [...state.data, ...result.data];
        state.page = page;
        state.hasNextPage = result.hasNextPage;
      } finally {
        state.loading = false;
      }
    };

    const loadNextPage = async (filter: FilterKeys) => {
      const state = conversationStates.value[filter];
      if (state.hasNextPage && !state.loading) {
        await fetchConversations(filter, state.page + 1);
      }
    };

    const getDisplayedContacts = (filter: FilterKeys): Contact[] => {
      const state = conversationStates.value[filter];
      if (state.loading && state.page === 0) {
        return Array.from(
          { length: chatsPerPage.value },
          (_, i) =>
            ({
              id: -i - 1,
              name: "در حال",
              lastName: "بارگذاری...",
              imageUrl: "https://i.pravatar.cc/150?u=loading",
              isOnline: false,
              lastSeen: new Date(),
              isActive: true,
              unreadCount: 0,
              serviceType: "chat",
              userType: ["user"],
              lastMessage: {
                id: -1,
                conversationId: -i - 1,
                date: new Date(),
                type: "text",
                text: "در حال بارگذاری پیام...",
                isEdited: false,
                senderId: -1,
                isSent: true,
                isRead: true,
              },
            }) as Contact,
        );
      }
      return [...state.data].sort((a, b) => {
        const dateA = a.lastMessage ? new Date(a.lastMessage.date).getTime() : 0;
        const dateB = b.lastMessage ? new Date(b.lastMessage.date).getTime() : 0;
        return dateB - dateA;
      });
    };

    const getContactById = (id: number): Contact | null => {
      for (const key in conversationStates.value) {
        const contact = conversationStates.value[key as FilterKeys].data.find(
          (c) => c.id === id,
        );
        if (contact) return contact;
      }
      return null;
    };

    const markAsRead = (conversationId: number) => {
      for (const key in conversationStates.value) {
        const contact = conversationStates.value[key as FilterKeys].data.find(
          (c) => c.id === conversationId,
        );
        if (contact) {
          contact.unreadCount = 0;
          if (contact.lastMessage) contact.lastMessage.isRead = true;
        }
      }
      void adapter.chat.markRead(conversationId);
    };

    const updateLastMessage = (conversationId: number, message: Message) => {
      for (const key in conversationStates.value) {
        const state = conversationStates.value[key as FilterKeys];
        const contact = state.data.find((c) => c.id === conversationId);
        if (contact) contact.lastMessage = { ...message };
      }
    };

    const patchLastMessage = (
      conversationId: number,
      messageId: number,
      updates: Partial<Message>,
    ) => {
      for (const key in conversationStates.value) {
        const contact = conversationStates.value[key as FilterKeys].data.find(
          (c) => c.id === conversationId,
        );
        if (
          contact &&
          contact.lastMessage &&
          contact.lastMessage.id === messageId
        ) {
          contact.lastMessage = { ...contact.lastMessage, ...updates };
        }
      }
    };

    const unreadCount = computed(() => {
      const uniqueContacts = new Map<number, Contact>();
      for (const key in conversationStates.value) {
        const state = conversationStates.value[key as FilterKeys];
        state.data.forEach((c) => {
          if (!uniqueContacts.has(c.id)) uniqueContacts.set(c.id, c);
        });
      }
      return Array.from(uniqueContacts.values()).filter(
        (c) => c.lastMessage && c.lastMessage.isRead === false,
      ).length;
    });

    return {
      currentUserId,
      chosenRole,
      currentUserBirthDate,
      conversationStates,
      activeConversationId,
      profileViewOpen,
      messagesMap,
      chatsPerPage,
      unreadCount,
      setSelectedChat,
      openProfile,
      closeProfile,
      fetchConversations,
      loadNextPage,
      getDisplayedContacts,
      getContactById,
      markAsRead,
      updateLastMessage,
      patchLastMessage,
    };
  });

  const useServiceStore = defineStore("service", () => {
    const isLoading = ref(false);
    const isLoadingServices = ref(false);
    const currentResultPage = ref(1);
    const searchText = ref("");
    const selectedServiceId = ref(-1);
    const providersPerPage = ref(10);
    const hasProviderNextPage = ref(true);

    const services = ref<Service[]>([]);

    const createSkeletonProvider = (): Provider =>
      ({
        id: -1,
        name: "...",
        lastName: "...",
        isOnline: false,
        lastSeen: new Date(),
        imageUrl: "",
        phoneNumber: "",
        isActive: false,
        birthDate: new Date(),
        serviceType: "chat",
        userType: ["business"],
        expertise: "...",
        type: "public",
        service: {} as Service,
        clinics: [],
        fellowships: [],
      }) as Provider;

    const providers = ref<Provider[]>(
      new Array(10).fill(null).map(createSkeletonProvider),
    );

    const resetProviderData = () => {
      providers.value = new Array(10).fill(null).map(createSkeletonProvider);
      currentResultPage.value = 1;
      hasProviderNextPage.value = true;
    };

    const fetchServices = async () => {
      isLoadingServices.value = true;
      try {
        services.value = await adapter.service.fetchServices();
      } finally {
        isLoadingServices.value = false;
      }
    };

    const fetchProviders = async (
      isLoadMore = false,
      serviceId?: number,
      searchString?: string,
    ) => {
      if (isLoading.value || (!hasProviderNextPage.value && isLoadMore)) return;
      isLoading.value = true;
      const effectiveServiceId = serviceId ?? selectedServiceId.value;
      if (!isLoadMore) resetProviderData();
      try {
        const result = await adapter.service.fetchProviders({
          serviceId: effectiveServiceId,
          page: currentResultPage.value,
          pageSize: providersPerPage.value,
          search: searchString,
        });
        providers.value =
          currentResultPage.value === 1
            ? result.data
            : [...providers.value, ...result.data];
        hasProviderNextPage.value = result.hasNextPage;
        currentResultPage.value++;
      } finally {
        isLoading.value = false;
      }
    };

    return {
      isLoading,
      isLoadingServices,
      currentResultPage,
      searchText,
      selectedServiceId,
      providersPerPage,
      hasProviderNextPage,
      services,
      providers,
      fetchServices,
      fetchProviders,
      resetProviderData,
    };
  });

  const useChatActionStore = defineStore("chatAction", () => {
    const { t } = useI18n();
    const { openToast } = useAppToast();
    const { formatDateShort, formatTime } = useDate();
    const chatStore = useChatStore();
    const serviceStore = useServiceStore();

    const uploadProgress = ref<
      Map<number, { progress: number; uploaded: number; total: number }>
    >(new Map());

    const processingActions = ref(new Map<number, string>());

    const isActionBusy = (messageId: number, actionKey: string) =>
      processingActions.value.get(messageId) === actionKey;

    const isSelectMode = ref(false);
    const selectedMessages = ref<Map<number, ExtendedMessage>>(new Map());
    const isMenuOpen = ref(false);
    const replyingTo = ref<ExtendedMessage | null>(null);
    const editingMessage = ref<ExtendedMessage | null>(null);
    const editWindowHours = ref(6);

    const deleteBus = useEventBus<number[]>("chat-delete");
    const sendBus = useEventBus<Message[]>("chat-send");
    const editBus = useEventBus<ExtendedMessage>("edit-message");
    const personalInfoBus = useEventBus<number>("personal-info-request");
    const prescriptionBus = useEventBus<number>("prescription");
    const updateBus = useEventBus<{ id: number; updates: Partial<Message> }>(
      "chat-update",
    );

    const triggerPersonalInfoRequest = (conversationId: number) => {
      personalInfoBus.emit(conversationId);
    };

    const triggerPrescription = (conversationId: number) => {
      prescriptionBus.emit(conversationId);
    };

    const selectedArray = computed(() =>
      Array.from(selectedMessages.value.values()),
    );
    const canReply = computed(() => selectedMessages.value.size <= 1);
    const canEdit = computed(() => {
      if (selectedMessages.value.size !== 1) return false;
      const msg = selectedArray.value[0];
      if (!msg) return false;
      const isMine = msg.senderId === chatStore.currentUserId;
      const hoursPassed =
        (Date.now() - new Date(msg.date).getTime()) / (1000 * 60 * 60);
      return isMine && hoursPassed < editWindowHours.value;
    });
    const canDelete = computed(() => {
      if (selectedMessages.value.size === 0) return false;
      return selectedArray.value.every((msg) => {
        const isMine = msg.senderId === chatStore.currentUserId;
        const hoursPassed =
          (Date.now() - new Date(msg.date).getTime()) / (1000 * 60 * 60);
        return isMine && hoursPassed < editWindowHours.value;
      });
    });

    const clearActions = () => {
      isSelectMode.value = false;
      selectedMessages.value.clear();
      replyingTo.value = null;
      editingMessage.value = null;
    };

    const triggerDelete = async (specificIds?: number[]) => {
      const targets = specificIds?.length
        ? specificIds
        : selectedArray.value.map((m) => m.id);
      if (targets.length === 0) return;

      targets.forEach((id) =>
        processingActions.value.set(id, "cancel-request"),
      );
      deleteBus.emit(targets);
      clearActions();

      try {
        await adapter.chatAction.deleteMessages(targets);
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
        const latest = tempMessages[tempMessages.length - 1]!;
        chatStore.updateLastMessage(latest.conversationId, latest);
      }

      await Promise.all(
        tempMessages.map(async (tempMsg) => {
          const tracksProgress = tempMsg.type !== "text";
          try {
            const canonical = await adapter.chatAction.sendMessage(tempMsg, {
              onProgress: tracksProgress
                ? (e) => {
                    if (e.progress >= 100) {
                      uploadProgress.value.delete(tempMsg.id);
                    } else {
                      uploadProgress.value.set(tempMsg.id, {
                        progress: e.progress,
                        uploaded: e.uploaded,
                        total: e.total,
                      });
                    }
                  }
                : undefined,
            });

            uploadProgress.value.delete(tempMsg.id);
            const updates = { id: canonical.id, isSent: true };
            updateBus.emit({ id: tempMsg.id, updates });
            chatStore.patchLastMessage(tempMsg.conversationId, tempMsg.id, updates);
          } catch {
            uploadProgress.value.delete(tempMsg.id);
            updateBus.emit({ id: tempMsg.id, updates: { isSent: false } });
            chatStore.patchLastMessage(tempMsg.conversationId, tempMsg.id, {
              isSent: false,
            });
          }
        }),
      );
    };

    const saveEditMessage = async (id: number, text: string) => {
      const conversationId = editingMessage.value?.conversationId;

      updateBus.emit({ id, updates: { text, isSent: false } });
      if (conversationId)
        chatStore.patchLastMessage(conversationId, id, { text, isSent: false });

      clearActions();

      try {
        await adapter.chatAction.editMessage(id, text);
        updateBus.emit({ id, updates: { isSent: true, isEdited: true } });
        if (conversationId)
          chatStore.patchLastMessage(conversationId, id, {
            isSent: true,
            isEdited: true,
          });
      } catch {
        updateBus.emit({ id, updates: { isSent: false } });
        if (conversationId)
          chatStore.patchLastMessage(conversationId, id, { isSent: false });
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
      const newMap = new Map();
      newMap.set(message.id, message);
      selectedMessages.value = newMap;
    };

    const copyMessageText = () => {
      const textToCopy = selectedArray.value
        .map((msg) => {
          const isMine = msg.senderId === chatStore.currentUserId;
          const senderName = isMine
            ? t("chat.you")
            : msg.contact?.name || "User";
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

    const sendServiceRequest = (
      conversationId: number,
      serviceId: number,
      serviceLabel: string,
      selectedProviders: Provider[],
    ) => {
      const isAutoSelect = selectedProviders.length === 0;
      const requestStatus = isAutoSelect ? "searching" : "pending";

      const mappedProviders: RequestProvider[] = selectedProviders.map((p) => ({
        ...p,
        status: "pending",
      }));

      const fullServiceData = serviceStore.services.find(
        (s) => s.id === serviceId,
      );

      const newRequestMessage: Message = {
        id: Math.floor(Math.random() * -1000000),
        conversationId,
        date: new Date(),
        type: "text",
        senderId: chatStore.currentUserId,
        isSent: false,
        isRead: false,
        isEdited: false,
        repliedTo: null as any,
        request: {
          id: Math.floor(Math.random() * 10000),
          type: "add-person",
          request: {
            ...fullServiceData,
            id: serviceId,
            label: serviceLabel,
            status: requestStatus,
            provider: mappedProviders,
            service: fullServiceData,
          } as ServiceRequest,
        },
      };

      void sendMessage([newRequestMessage]);
    };

    const sendPersonalInfoRequest = (conversationId: number) => {
      const newRequestMessage: Message = {
        id: Math.floor(Math.random() * -1000000),
        conversationId,
        date: new Date(),
        type: "text",
        senderId: chatStore.currentUserId,
        isSent: false,
        isRead: false,
        isEdited: false,
        repliedTo: null as any,
        request: {
          id: Math.floor(Math.random() * 10000),
          type: "personal-info",
          request: {
            id: Math.floor(Math.random() * 10000),
            date: new Date(),
            status: "pending",
          } as AccessRequest,
        },
      };

      void sendMessage([newRequestMessage]);
    };

    const handleAccessResponse = async (
      messageId: number,
      conversationId: number,
      key: "confirm-access" | "reject-access",
      currentRequest: any,
    ) => {
      processingActions.value.set(messageId, key);
      try {
        const decision = key === "confirm-access" ? "approved" : "rejected";
        await adapter.chatAction.respondToAccessRequest(messageId, decision);

        const updatedRequest = {
          ...currentRequest,
          request: { ...currentRequest.request, status: decision },
        };

        updateBus.emit({ id: messageId, updates: { request: updatedRequest } });
        chatStore.patchLastMessage(conversationId, messageId, {
          request: updatedRequest,
        });
      } catch (error) {
        console.error("Action failed", error);
      } finally {
        processingActions.value.delete(messageId);
      }
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

  const useMedicationStore = defineStore("medication", () => {
    const { locale } = useI18n();

    const medications = ref<Medication[]>([]);
    const searchResults = ref<Medication[]>([]);
    const isLoading = ref(false);
    let debounceTimeout: ReturnType<typeof setTimeout> | null = null;
    let searchToken = 0;

    const mapToDropdown = (med: Medication): DropdownOption => ({
      label: String(locale.value === "en" ? med.englishTitle : med.title),
      value: med.id,
    });

    const medicationOptions = computed((): DropdownOption[] =>
      medications.value.map((med) => mapToDropdown(med)),
    );

    const getMedicationOptionById = computed(
      () =>
        (id: number | string): DropdownOption | null => {
          const med = medications.value.find((m) => m.id === Number(id));
          return med ? mapToDropdown(med) : null;
        },
    );

    const fetchMedications = async () => {
      medications.value = await adapter.medication.fetchMedications();
    };

    const searchMedications = (query: string) => {
      if (debounceTimeout) clearTimeout(debounceTimeout);

      if (!query.trim()) {
        searchResults.value = [];
        isLoading.value = false;
        return;
      }

      isLoading.value = true;
      const token = ++searchToken;

      debounceTimeout = setTimeout(async () => {
        try {
          const results = await adapter.medication.searchMedications(query);
          if (token === searchToken) {
            searchResults.value = results;
          }
        } finally {
          if (token === searchToken) {
            isLoading.value = false;
          }
        }
      }, 500);
    };

    return {
      medications,
      searchResults,
      isLoading,
      medicationOptions,
      getMedicationOptionById,
      fetchMedications,
      searchMedications,
    };
  });

  return {
    useChatStore,
    useServiceStore,
    useChatActionStore,
    useMedicationStore,
  };
};
