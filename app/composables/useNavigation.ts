import { computed } from "vue";
import { useI18n, useRoute, useProfileStore } from "#imports";
import type { NavItem } from "~/types/components/nav-item";
import type { NavSubItem } from "~/types/components/nav-sub-item";
export const useNavigation = () => {
  const { t } = useI18n();
  const route = useRoute();
  const profileStore = useProfileStore();

  const prefix = (path: string) => {
    if (path === "#" || path.startsWith("http")) return path;
    return `/dashboard${path}`.replace(/\/+/g, "/");
  };

  const rawMenu = computed((): NavItem[] => [
    {
      key: "home",
      label: t("sidebar.dashboard"),
      roles: ["user"],
      icon: "PhHouseSimple",
      to: prefix(""),
    },
    {
      key: "services",
      label: t("sidebar.services"),
      roles: ["user"],
      icon: "PhSquaresFour",
      links: [
        {
          label: t("sidebar.collaborationRequest"),
          icon: "PhStack",
          to: prefix("/applications/collaboration"),
        },
        {
          label: t("sidebar.serviceHistory"),
          icon: "PhClockCounterClockwise",
          to: prefix("/applications/services/reservations/list"),
        },
        { label: t("sidebar.healthReport"), to: "#", disabled: true },
        {
          label: t("sidebar.healthAssessment"),
          to: "#",
          icon: "PhHeartbeat",
          children: [
            {
              label: t("sidebar.healthHistory"),
              to: prefix(
                "/applications/services/reservations/services?category=screening-and-risk&sub-category=screening-and-risk > health-history",
              ),
            },
            {
              label: t("sidebar.biometricAssessment"),
              to: prefix(
                "/applications/services/reservations/services?category=screening-and-risk&sub-category=screening-and-risk%20%3E%20vital-signs",
              ),
            },
            {
              label: t("sidebar.riskAssessment"),
              to: prefix(
                "/applications/services/reservations/services?category=screening-and-risk",
              ),
            },
          ],
        },
        { label: t("sidebar.education"), to: "#", disabled: true },
        {
          label: t("sidebar.consultation"),
          icon: "PhHandHeart",
          to: prefix(
            "/applications/services/reservations/services?category=consulting",
          ),
        },
        { label: t("sidebar.appointment"), to: "#", disabled: true },
        {
          label: t("sidebar.store"),
          icon: "PhStorefront",
          to: "#",
          children: [
            { label: t("sidebar.medications"), to: "#", disabled: true },
            { label: t("sidebar.medicalEquipment"), to: "#", disabled: true },
          ],
        },
      ],
    },
    {
      key: "business",
      label: t("sidebar.business"),
      roles: ["business"],
      icon: "PhBriefcase",
      links: [
        {
          label: t("sidebar.dashboard"),
          icon: "PhSquaresFour",
          to: prefix("/business/dashboard"),
        },
        {
          label: t("sidebar.serviceProviders"),
          icon: "PhUsers",
          to: prefix("/business/employee"),
        },
        {
          label: t("sidebar.collaborationRequests"),
          icon: "PhArrowsClockwise",
          to: prefix("/business/collaborations"),
        },
        {
          label: t("sidebar.serviceManagement"),
          icon: "PhStack",
          to: prefix("/business/services"),
        },
        {
          label: t("sidebar.shiftManagement"),
          icon: "PhClock",
          to: prefix("/business/shifts"),
        },
      ],
    },
    {
      key: "personnel",
      label: t("sidebar.personnel"),
      roles: ["employee"],
      icon: "PhUserList",
      links: [
        {
          label: t("sidebar.reservations"),
          icon: "PhCalendarSearch",
          to: prefix("/personnel/reservations"),
        },
        {
          label: t("sidebar.patientInvoices"),
          icon: "PhFileText",
          to: prefix("/personnel/invoices"),
        },
      ],
    },
    {
      key: "calendar",
      label: t("sidebar.calendar"),
      roles: ["user"],
      icon: "PhCalendar",
      to: prefix("/calendar"),
    },
    {
      key: "financial",
      label: t("sidebar.financial"),
      roles: ["user"],
      icon: "PhWallet",
      links: [
        {
          label: t("sidebar.wallet"),
          icon: "PhWallet",
          to: prefix("/financial/wallet"),
        },
        {
          label: t("sidebar.invoices"),
          icon: "PhFileText",
          to: prefix("/financial/invoices"),
        },
        {
          label: t("sidebar.transactions"),
          icon: "PhCreditCard",
          to: prefix("/financial/transactions"),
        },
      ],
    },
    {
      key: "chat",
      label: t("sidebar.chat"),
      roles: ["user"],
      icon: "PhChatCircleDots",
      links: [
        {
          label: t("sidebar.chat"),
          icon: "PhChatCircleDots",
          to: prefix("/chat"),
        },
        { label: t("sidebar.aiAssistant"), icon: "PhRobot", to: prefix("/ai") },
      ],
    },
  ]);

  /**
   * Filtered Menu Items based on role
   */
  const menuItems = computed(() => {
    const currentRole = profileStore.chosenRole;
    return rawMenu.value.filter((item) => {
      if (currentRole === "user") return item.roles.includes("user");
      return item.roles.includes("user") || item.roles.includes(currentRole);
    });
  });

  /* =========================================================================
     NEW METHODS
     ========================================================================= */

  /**
   * 1. Returns the root level objects of the filtered menu.
   * Useful for rendering the main sidebar icons/tabs.
   */
  const getCategories = computed(() => {
    return menuItems.value;
  });

  /**
   * 2. Returns the child routes (links) for a specific root category.
   * @param categoryKey The unique key of the root item (e.g., 'services')
   */
  const getRoutesByCategory = (categoryKey: string): NavSubItem[] => {
    const category = menuItems.value.find((item) => item.key === categoryKey);
    return category?.links || [];
  };

  const isRouteActive = (path: string) => route.path === path;

  const isParentActive = (item: NavItem) => {
    if (item.to && isRouteActive(item.to)) return true;
    if (item.links) {
      return item.links.some((link) => {
        if (isRouteActive(link.to)) return true;
        if (link.children) {
          return link.children.some((child) => isRouteActive(child.to));
        }
        return false;
      });
    }
    return false;
  };

  return {
    menuItems,
    getCategories,
    getRoutesByCategory,
    isRouteActive,
    isParentActive,
  };
};
