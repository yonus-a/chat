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

  const secondaryRoutes = computed((): NavSubItem[] => [
    {
      label: t("sidebar.collabrationRequest"),
      roles: ["user"],
      icon: "PhBriefcase",
      to: prefix("/collabrate"),
    },
    {
      label: t("sidebar.inviteFriends"),
      roles: ["user"],
      icon: "PhUserPlus",
      to: prefix("/invite-friends"),
    },
  ]);

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
      icon: "PhSquaresFour", // Replaced PhWidget as requested
      links: [
        {
          label: t("sidebar.collaborationRequest"),
          icon: "PhStack",
          roles: ["business"],
          to: prefix("/applications/collaboration"),
        },
        {
          label: t("sidebar.serviceHistory"),
          icon: "PhClockCounterClockwise",
          roles: ["user"],
          to: prefix("/applications/services/reservations/list"),
        },
        {
          label: t("sidebar.healthReport"),
          roles: ["user"],
          to: "#",
          disabled: true,
        },
        {
          label: t("sidebar.healthAssessment"),
          to: "#",
          roles: ["user"],
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
        {
          label: t("sidebar.education"),
          roles: ["user"],
          to: "#",
          disabled: true,
        },
        {
          label: t("sidebar.consultation"),
          icon: "PhHandHeart",
          roles: ["user"],
          to: prefix(
            "/applications/services/reservations/services?category=consulting",
          ),
        },
        {
          label: t("sidebar.appointment"),
          roles: ["user"],
          to: "#",
          disabled: true,
        },
        {
          label: t("sidebar.store"),
          icon: "PhStorefront",
          roles: ["user"],
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
          roles: ["business"],
          to: prefix("/business/dashboard"),
        },
        {
          label: t("sidebar.serviceProviders"),
          icon: "PhUsers",
          roles: ["business"],
          to: prefix("/business/employee"),
        },
        {
          label: t("sidebar.collaborationRequests"),
          icon: "PhArrowsClockwise",
          roles: ["business"],
          to: prefix("/business/collaborations"),
        },
        {
          label: t("sidebar.serviceManagement"),
          icon: "PhStack",
          roles: ["business"],
          to: prefix("/business/services"),
        },
        {
          label: t("sidebar.shiftManagement"),
          icon: "PhClock",
          roles: ["business"],
          to: prefix("/business/shifts"),
        },
      ],
    },
    {
      key: "personnel",
      label: t("sidebar.personnel"),
      roles: ["employee"], // Matches legacy role
      icon: "PhUserList",
      links: [
        {
          label: t("sidebar.reservations"),
          icon: "PhCalendarSearch",
          roles: ["employee"],
          to: prefix("/personnel/reservations"),
        },
        {
          label: t("sidebar.patientInvoices"),
          icon: "PhFileText",
          roles: ["employee"],
          to: prefix("/personnel/invoices"),
        },
      ],
    },
    {
      key: "calendar",
      label: t("sidebar.calendar"),
      roles: ["user"],
      icon: "PhCalendarDots",
      to: prefix("/calendar"),
    },
    {
      key: "referral",
      label: t("sidebar.referral"),
      roles: ["user", "employee"],
      icon: "PhTreeStructure",
      to: prefix("/referral"),
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
          roles: ["user"],
          to: prefix("/financial/wallet"),
        },
        {
          label: t("sidebar.invoices"),
          icon: "PhFileText",
          roles: ["user"],
          to: prefix("/financial/invoices"),
        },
        {
          label: t("sidebar.transactions"),
          icon: "PhCreditCard",
          roles: ["user"],
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
          roles: ["user"],
          to: prefix("/chat"),
        },
        {
          label: t("sidebar.aiAssistant"),
          icon: "PhRobot",
          roles: ["user"],
          to: prefix("/ai"),
        },
      ],
    },
  ]);

  /**
   * Filtered Menu Items (Root level)
   */
  const menuItems = computed(() => {
    const currentRole = profileStore.chosenRole;
    return rawMenu.value.filter((item) => {
      if (currentRole === "user") return item.roles.includes("user");
      return item.roles.includes("user") || item.roles.includes(currentRole);
    });
  });

  /**
   * NEW: Filtered Sub-routes by Role
   */
  const getRoutesByCategory = (categoryKey: string): NavSubItem[] => {
    const category = menuItems.value.find((item) => item.key === categoryKey);
    if (!category || !category.links) return [];

    const currentRole = profileStore.chosenRole;

    return category.links.filter((link) => {
      const linkRoles = link.roles || ["user"]; // Fallback to user
      if (currentRole === "user") return linkRoles.includes("user");
      return linkRoles.includes("user") || linkRoles.includes(currentRole);
    });
  };

  const getCategories = computed(() => menuItems.value);
  const isRouteActive = (path: string) => route.path === path;

  const isParentActive = (item: NavItem) => {
    if (item.to && isRouteActive(item.to)) return true;
    if (item.links) {
      return item.links.some((link) => {
        if (isRouteActive(link.to)) return true;
        if (link.children)
          return link.children.some((child) => isRouteActive(child.to));
        return false;
      });
    }
    return false;
  };

  const shouldShowBottomNav = computed(() => {
    if (route.path.startsWith("/dashboard/chat")) {
      return !route.params.id;
    }
    const leafMeta = route.matched[route.matched.length - 1]?.meta;
    return leafMeta?.hideBottomNav !== true;
  });

  return {
    menuItems,
    getCategories,
    getRoutesByCategory,
    isRouteActive,
    secondaryRoutes,
    shouldShowBottomNav,
    isParentActive,
  };
};
