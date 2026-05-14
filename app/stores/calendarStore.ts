import { defineStore } from "pinia";
import type { CalendarAccess, ShareTypes } from "~/types/calendar";
import type { Contact } from "~/types/chat";
import { useAppToast, useI18n } from "#imports";

export const useCalendarStore = defineStore("calendar", () => {
  const { t } = useI18n();
  const { openToast } = useAppToast();

  const isLoadingShared = ref(true);
  const hasLoadedShared = ref(false);
  const errorLoadingShared = ref(false);
  const isSending = ref(false);

  const processingIds = ref<Record<number, boolean>>({});
  const sharedUsers = ref<CalendarAccess[]>([]);

  const isLoadingCalendar = ref(false);

  // --- Mock Data Generator ---
  const generateMockUsers = (): CalendarAccess[] => [
    {
      id: 1,
      name: "امیر",
      lastName: "سعیدی",
      isOnline: true,
      lastSeen: new Date(),
      imageUrl: "https://i.pravatar.cc/150?u=1",
      isActive: false,
      unreadCount: 2,
      serviceType: "chat",
      birthDate: new Date(),
      phoneNumber: "09134168227",
      nationalCode: "1235678901",
      userType: ["user"],
      accessType: "editor",
    },
    {
      id: 2,
      name: "سارا",
      lastName: "احمدی",
      isOnline: false,
      lastSeen: new Date(new Date().getTime() - 3600000),
      imageUrl: "https://i.pravatar.cc/150?u=2",
      isActive: true,
      unreadCount: 0,
      serviceType: "voice-call",
      birthDate: new Date(),
      phoneNumber: "09134168227",
      nationalCode: "1235678901",
      userType: ["user"],
      accessType: "viewer",
    },
  ];

  // --- Actions ---

  const fetchSharedUsers = async () => {
    isLoadingShared.value = true;
    errorLoadingShared.value = false;
    hasLoadedShared.value = false;
    try {
      // Simulated API delay
      await new Promise((resolve) => setTimeout(resolve, 2500));
      sharedUsers.value = generateMockUsers();
      hasLoadedShared.value = true;
    } catch (error) {
      errorLoadingShared.value = true;
      sharedUsers.value = [];
    } finally {
      isLoadingShared.value = false;
    }
  };

  /**
   * Adds a member to the shared list.
   * In a real app, this would be a POST request.
   */
  const withLoading = async (id: number, action: () => Promise<void>) => {
    processingIds.value = { ...processingIds.value, [id]: true };
    try {
      await action();
    } finally {
      const updated = { ...processingIds.value };
      delete updated[id];
      processingIds.value = updated;
    }
  };

  const addSharedUser = async (
    contact: Contact,
    access: ShareTypes = "viewer",
  ) => {
    if (sharedUsers.value.some((u) => u.id === contact.id)) return;

    // Optimistic Push
    sharedUsers.value.push({ ...contact, accessType: access });

    try {
      await withLoading(contact.id, async () => {
        // Simulate API
        await new Promise((resolve) => setTimeout(resolve, 1000));
      });
      openToast(t("calendar.share.api.success.add"), "success");
    } catch (error) {
      // Revert optimistic add if necessary
      sharedUsers.value = sharedUsers.value.filter((u) => u.id !== contact.id);
      openToast(t("calendar.share.api.error"), "error");
    }
  };

  const updateAccessType = async (userId: number, newAccess: ShareTypes) => {
    try {
      await withLoading(userId, async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const user = sharedUsers.value.find((u) => u.id === userId);
        if (user) {
          user.accessType = newAccess;
        }
      });
      openToast(t("calendar.share.api.success.edit"), "success");
    } catch (error) {
      openToast(t("calendar.share.api.error"), "error");
    }
  };

  const removeSharedUser = async (userId: number) => {
    try {
      await withLoading(userId, async () => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        sharedUsers.value = sharedUsers.value.filter((u) => u.id !== userId);
      });
      openToast(t("calendar.share.api.success.delete"), "success");
    } catch (error) {
      openToast(t("calendar.share.api.error"), "error");
    }
  };

  const refreshData = () => {};

  const colors = computed(() => [
    { label: t("general.colors.red"), value: "red", color: "#F34040" },
    { label: t("general.colors.orange"), value: "orange", color: "#F37040" },
    { label: t("general.colors.yellow"), value: "yellow", color: "#E9EF37" },
    { value: "green", label: t("general.colors.green"), color: "#8CE25E" },
    {
      value: "blueLight",
      label: t("general.colors.blueLight"),
      color: "#40F3E4",
    },
    { value: "blue", label: t("general.colors.blue"), color: "#555CEE" },
    { value: "purple", label: t("general.colors.purple"), color: "#CF40F3" },
    { value: "pink", label: t("general.colors.pink"), color: "#F897F6" },
    {
      value: "darkPink",
      label: t("general.colors.darkPink"),
      color: "#F49AA6",
    },
    { value: "black", label: t("general.colors.black"), color: "#2C2727" },
  ]);

  const addEventAccess = async (
    eventId: number,
    contact: Contact,
    access: ShareTypes = "viewer",
  ) => {
    try {
      await withLoading(contact.id, async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // In a real app, this updates the DB for that specific event
      });
      openToast(t("calendar.share.api.success.add"), "success");
    } catch (error) {
      openToast(t("calendar.share.api.error"), "error");
      throw error;
    }
  };

  const updateEventAccess = async (
    eventId: number,
    userId: number,
    newAccess: ShareTypes,
  ) => {
    try {
      await withLoading(userId, async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
      });
      openToast(t("calendar.share.api.success.edit"), "success");
    } catch (error) {
      openToast(t("calendar.share.api.error"), "error");
    }
  };

  const removeEventAccess = async (eventId: number, userId: number) => {
    try {
      await withLoading(userId, async () => {
        await new Promise((resolve) => setTimeout(resolve, 600));
      });
      openToast(t("calendar.share.api.success.delete"), "success");
    } catch (error) {
      openToast(t("calendar.share.api.error"), "error");
    }
  };

  return {
    addEventAccess,
    removeEventAccess,
    updateEventAccess,
    isSending,
    errorLoadingShared,
    sharedUsers,
    hasLoadedShared,
    isLoadingShared,
    fetchSharedUsers,
    addSharedUser,
    processingIds,
    updateAccessType,
    colors,
    isLoadingCalendar,
    refreshData,
    removeSharedUser,
  };
});
