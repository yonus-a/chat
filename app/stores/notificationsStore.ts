import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Notification } from "~/types/notification";

export const useNotificationsStore = defineStore("notifications", () => {
  // 1. Core State
  const isLoading = ref(false);
  const notifications = ref<Notification[]>([]);
  const isMarkingAllAsRead = ref(false);

  // --- Pagination State ---
  const itemsPerPage = ref(10);
  const currentPage = ref(1);
  const maxPages = ref(5); // Simulated max pages

  const hasNextPage = computed(() => currentPage.value < maxPages.value);

  const mockNotification: Notification = {
    id: 0,
    title: "در حال بارگذاری...",
    description: "لطفا شکیبا باشید...",
    date: new Date(),
    isRead: false,
    tag: "request",
    path: "#",
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

    isLoading.value = true;
    currentPage.value = page;

    // If it's the first page, we clear the list to show skeletons
    if (page === 1) notifications.value = [];

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const newData = generateMockData(page);

      // Append data if it's not the first page
      if (page === 1) {
        notifications.value = newData;
      } else {
        notifications.value = [...notifications.value, ...newData];
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      isLoading.value = false;
    }
  };

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

  return {
    markAllAsRead,
    isMarkingAllAsRead,
    isLoading,
    notifications,
    maxPages,
    fetchNotifications,
    loadNextPage,
    unreadCount,
    currentPage,
    displayedNotifications,
  };
});
