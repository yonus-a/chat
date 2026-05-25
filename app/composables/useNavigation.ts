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

  const secondaryRoutes = computed((): NavSubItem[] => []);

  const rawMenu = computed((): NavItem[] => [
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
