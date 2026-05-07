import { defineStore } from "pinia";
import type { SharedUserCalendar, ShareTypes } from "~/types/calendar";
import type { Contact } from "~/types/chat";

export const useCalendarStore = defineStore("calendar", () => {
  const isLoadingShared = ref(true);
  const hasLoadedShared = ref(false);
  const errorLoadingShared = ref(false);
  const isSending = ref(false);

  const processingIds = ref<Record<number, boolean>>({});
  const sharedUsers = ref<SharedUserCalendar[]>([]);

  // --- Mock Data Generator ---
  const generateMockUsers = (): SharedUserCalendar[] => [
    {
      id: 101,
      name: "سارا",
      lastName: "احمدی",
      isOnline: true,
      lastSeen: new Date(),
      imageUrl: "https://i.pravatar.cc/150?u=101",
      isActive: true,
      unreadCount: 0,
      serviceType: "chat",
      birthDate: new Date(),
      phoneNumber: "09123456789",
      nationalCode: "0012345678",
      accessType: "editor",
    },
    {
      id: 102,
      name: "محمد",
      lastName: "رضایی",
      isOnline: false,
      lastSeen: new Date(),
      imageUrl: "", // Should trigger your /images/no-avatar.webp logic
      isActive: true,
      unreadCount: 0,
      serviceType: "chat",
      birthDate: new Date(),
      phoneNumber: "09987654321",
      nationalCode: "0098765432",
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
    // 1. Prevent duplicates immediately
    if (sharedUsers.value.some((u) => u.id === contact.id)) return;

    // 2. Push immediately so the UI renders the component
    sharedUsers.value.push({ ...contact, accessType: access });

    // 3. Track loading for this specific ID during the "API call"
    await withLoading(contact.id, async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // In a real app, if the request fails, you would filter them back out here
    });
  };

  const updateAccessType = async (userId: number, newAccess: ShareTypes) => {
    await withLoading(userId, async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Ensure we find the user in the store's reactive array
      const user = sharedUsers.value.find((u) => u.id === userId);
      if (user) {
        user.accessType = newAccess;
      }
    });
  };

  const removeSharedUser = async (userId: number) => {
    await withLoading(userId, async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      sharedUsers.value = sharedUsers.value.filter((u) => u.id !== userId);
    });
  };
  return {
    isSending,
    errorLoadingShared,
    sharedUsers,
    hasLoadedShared,
    isLoadingShared,
    fetchSharedUsers,
    addSharedUser,
    processingIds,
    updateAccessType,
    removeSharedUser,
  };
});
