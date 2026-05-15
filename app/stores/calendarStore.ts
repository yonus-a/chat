import { defineStore } from "pinia";
import type {
  CalendarAccess,
  ShareTypes,
  CalendarSettingsPayload,
} from "~/types/calendar";
import type { Contact } from "~/types/chat";
import { useAppToast, useI18n } from "#imports";
import { useCookie } from "#imports";

export const useCalendarStore = defineStore("calendar", () => {
  const { t, locale } = useI18n();
  const { openToast } = useAppToast();

  const holidaysMap = ref<
    Record<string, { isHoliday: boolean; titles: string[] }>
  >({});

  // --- Add to the Store Actions ---
  const ensureHolidays = async (startDate: Date, endDate: Date) => {
    const datesToFetch: Date[] = [];
    const d = new Date(startDate);
    d.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Find dates we haven't fetched yet
    while (d <= end) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dayStr = String(d.getDate()).padStart(2, "0");
      const iso = `${y}-${m}-${dayStr}`;

      if (!holidaysMap.value[iso]) {
        datesToFetch.push(new Date(d));
        // Mark as 'pending' to prevent duplicate requests
        holidaysMap.value[iso] = { isHoliday: false, titles: [] };
      }
      d.setDate(d.getDate() + 1);
    }

    if (datesToFetch.length === 0) return;

    // Fetch missing dates concurrently
    await Promise.all(
      datesToFetch.map(async (date) => {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        try {
          // Using WC (World Calendar/Gregorian) as standard input
          const config = useRuntimeConfig(); // Assuming you store API key in nuxt config
          const res: any = await $fetch(
            `https://api.apieco.ir/farsicalendar/api/WC/${day}/${month}/${year}`,
            {
              headers: {
                "apieco-key": config.public.apiecoKey || "YOUR_API_KEY",
              },
            },
          );

          const values = res?.values || [];
          const isHoliday = values.some((v: any) => v.dayoff === true);
          const titles = values.map((v: any) => v.occasion).filter(Boolean);

          // Vue's reactivity will automatically update the grid when this resolves!
          holidaysMap.value[iso] = { isHoliday, titles };
        } catch (e) {
          console.error("Holiday fetch failed for", iso);
        }
      }),
    );
  };

  const isLoadingShared = ref(true);
  const hasLoadedShared = ref(false);
  const errorLoadingShared = ref(false);
  const isSending = ref(false);

  const getDefaultSettings = (): CalendarSettingsPayload => {
    const currentLocale = locale.value;

    let defaultCalendar: "jalaali" | "georgian" | "islamic" = "georgian";
    let defaultStartOfWeek = "monday";

    if (currentLocale === "fa") {
      defaultCalendar = "jalaali";
      defaultStartOfWeek = "saturday";
    } else if (currentLocale === "ar") {
      defaultCalendar = "islamic";
      defaultStartOfWeek = "sunday"; // Standard start for Arabic/Islamic calendars
    }

    return {
      calendar: defaultCalendar,
      startOfWeek: defaultStartOfWeek,
      // Natively detects the user's actual browser time zone! (e.g. 'Asia/Tehran')
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      showHolidays: true,
      showAi: true,
      showMedicine: true,
      showServices: true,
      showTasks: true,
    };
  };

  // --- 2. Update your cookie initialization to use the function ---
  const settingsCookie = useCookie<CalendarSettingsPayload>(
    "calendar_settings",
    {
      default: () => getDefaultSettings(),
      watch: true,
    },
  );

  const settings = ref<CalendarSettingsPayload>(settingsCookie.value);

  // 2. Action to update settings
  const updateSettings = (newSettings: CalendarSettingsPayload) => {
    settings.value = { ...newSettings };
    settingsCookie.value = { ...newSettings };
    //  openToast(t("general.success"), "success"); // Optional feedback
  };

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
    {
      label: t("general.colors.red"),
      value: "red",
      color: "var(--background-image-diamond-error)",
    },
    {
      label: t("general.colors.green"),
      value: "green",
      color: "var(--background-image-diamond-primary-secondary)",
    },
    {
      label: t("general.colors.yellow"),
      value: "yellow",
      color: "var(--background-image-diamond-warning)",
    },
    {
      label: t("general.colors.black"),
      value: "black",
      color: "var(--background-image-diamond-black)",
    },
    {
      label: t("general.colors.gray"),
      value: "gray",
      color: "var(--background-image-diamond-gray)",
    },
    {
      label: t("general.colors.white"),
      value: "white",
      color: "#F8F8FA",
    },
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
    updateSettings,
    settings,
    ensureHolidays,
    holidaysMap,
  };
});
