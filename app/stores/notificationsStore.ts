import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Notification } from "~/types/notification";

export const useNotificationsStore = defineStore("notifications", () => {
  // 1. Core State
  const isLoading = ref(false);
  const notifications = ref<Notification[]>([]);
  const pageMap = ref<Record<number, Notification[]>>({});
  const isMarkingAllAsRead = ref(false);
  const hasLoadedFirstPage = ref(false);

  // --- Pagination State ---
  const itemsPerPage = ref(10);
  const currentPage = ref(1);
  const maxPages = ref(5); // Simulated max pages

  const hasNextPage = computed(() => currentPage.value < maxPages.value);

  const mockNotification: Notification = {
    id: 1,
    title: "در حال بارگذاری",
    description: "لطفا صبر کنید",
    date: new Date(),
    isRead: false,
    tag: "request",
    path: "",
  };

  const generateMockData = (page: number): Notification[] => {
    // Generates different IDs based on page to simulate new data
    return Array.from({ length: itemsPerPage.value }, (_, i) => ({
      id: (page - 1) * itemsPerPage.value + i + 1,
      title: `اطلاعیه صفحه ${page} - شماره ${i + 1}`,
      description:
        "این یک متن شبیه‌سازی شده برای بررسی اسکرول و بارگذاری صفحات بعدی است.",
      date: new Date(Date.now() - page * 3600000),
      isRead: false,
      tag: "reminder",
      path: "/dashboard",
    }));
  };

  // 3. Loading Simulation Function
  const fetchNotifications = async (page: number = 1) => {
    if (isLoading.value) return;

    // Check if we already have this data (Circuit Breaker for Desktop)
    if (pageMap.value[page]) {
      currentPage.value = page;
      return;
    }

    isLoading.value = true;
    currentPage.value = page;

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const newData = generateMockData(page);

      // Store in Map for Desktop random access
      pageMap.value[page] = newData;

      // Maintain flat array for Mobile infinite scroll
      if (page === 1) {
        notifications.value = newData;
        hasLoadedFirstPage.value = true;
      } else {
        // Ensure we don't add duplicates if user switches between mobile/desktop
        const existingIds = new Set(notifications.value.map((n) => n.id));
        const filteredNew = newData.filter((n) => !existingIds.has(n.id));
        notifications.value = [...notifications.value, ...filteredNew];
      }
    } finally {
      isLoading.value = false;
    }
  };

  const getDesktopPageItems = computed(() => {
    if (isLoading.value && !pageMap.value[currentPage.value]) {
      // Show skeletons for the specific page being loaded
      return Array.from({ length: itemsPerPage.value }, (_, i) => ({
        ...mockNotification,
        id: -(currentPage.value * 100 + i), // Unique skeleton IDs per page
      }));
    }
    return pageMap.value[currentPage.value] || [];
  });

  // 4. Final Display Data (Sorted by date, newest first)
  const loadNextPage = async () => {
    if (hasNextPage.value && !isLoading.value) {
      await fetchNotifications(currentPage.value + 1);
    }
  };

  const displayedNotifications = computed(() => {
    // Show skeletons ONLY on the first load of page 1
    if (isLoading.value && currentPage.value === 1) {
      return Array.from({ length: itemsPerPage.value }, (_, i) => ({
        ...mockNotification,
        id: -i - 1,
      }));
    }
    return notifications.value;
  });
  const markAllAsRead = async () => {
    if (isMarkingAllAsRead.value) return;

    isMarkingAllAsRead.value = true;
    try {
      // 1. Simulate API call to update database
      await new Promise((resolve) => setTimeout(resolve, 800));

      // 2. After success: Update local state
      // We set isRead to true for all items to clear the unread count
      notifications.value.forEach((notification) => {
        notification.isRead = true;
      });
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    } finally {
      isMarkingAllAsRead.value = false;
    }
  };

  const unreadCount = computed(() => {
    let unreadNotifications = notifications.value.filter(
      (notification) => notification.isRead === false,
    );
    return unreadNotifications.length;
  });

  const fetchNotificationById = async (id: number) => {
    // Return existing if found
    const existing = notifications.value.find((n) => n.id === id);
    if (existing) return existing;

    try {
      // Mock API Call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mock: Notification = {
        id,
        title: `اطلاعیه شماره ${id}`,
        description: "این متن از دیتابیس واکشی شده است.",
        date: new Date(),
        isRead: true,
        tag: "request",
        path: "#",
      };

      notifications.value.push(mock);
      return mock;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  return {
    markAllAsRead,
    isMarkingAllAsRead,
    isLoading,
    notifications,
    maxPages,
    fetchNotifications,
    loadNextPage,
    hasLoadedFirstPage,
    hasNextPage,
    unreadCount,
    fetchNotificationById,
    mockNotification,
    currentPage,
    getDesktopPageItems,
    displayedNotifications,
  };
});
