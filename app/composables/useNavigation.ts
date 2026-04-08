import { computed } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "#imports";
import { useNotificationStore } from "#imports";

export const useNavigation = () => {
  const { t } = useI18n();
  const route = useRoute();
  const notificationsStore = useNotificationStore();

  // 1. The Source of Truth for all Dashboard Routes
  const navigationGroups = computed(() => [
    {
      title: t("sidebar.sideBarRoutes.menu.title"),
      children: [
        {
          path: "/dashboard",
          title: t("sidebar.sideBarRoutes.menu.dashboard"),
          icon: "PhChartPieSlice",
        },
        {
          path: "/dashboard/notifications",
          title: t("sidebar.sideBarRoutes.menu.notifications"),
          icon: "PhBell",
          count: notificationsStore.unreadCount,
        },
        {
          path: "/dashboard/orders",
          title: t("sidebar.sideBarRoutes.menu.orders"),
          icon: "PhClipboardText",
        },
        {
          path: "/dashboard/wallet",
          title: t("sidebar.sideBarRoutes.menu.wallet"),
          icon: "PhWallet",
        },
        {
          path: "/dashboard/users",
          title: t("sidebar.sideBarRoutes.menu.users"),
          icon: "PhUsers",
        },
        {
          path: "/dashboard/analytics",
          title: t("sidebar.sideBarRoutes.menu.analytics"),
          icon: "PhChartLine",
          //  children: [
          //    {
          //      path: "/dashboard/analytics/realtime",
          //      title: t("sidebar.sideBarRoutes.menu.overview"),
          //      icon: "PhChartPieSlice",
          //    },
          //  ],
        },
      ],
    },
    {
      title: t("sidebar.sideBarRoutes.inventory.title"),
      children: [
        {
          path: "/dashboard/products",
          title: t("sidebar.sideBarRoutes.inventory.products"),
          icon: "PhStorefront",
        },
        {
          path: "/dashboard/categories",
          title: t("sidebar.sideBarRoutes.inventory.categories"),
          icon: "PhSquaresFour",
        },
        {
          path: "/dashboard/promo",
          title: t("sidebar.sideBarRoutes.inventory.promo"),
          icon: "PhSealPercent",
        },
      ],
    },
    {
      title: t("sidebar.sideBarRoutes.other.title"),
      children: [
        {
          path: "/dashboard/profile/create-profile",
          title: t("sidebar.sideBarRoutes.other.profile"),
          icon: "PhUser",
        },
        {
          path: "/dashboard/settings",
          title: t("sidebar.sideBarRoutes.other.settings"),
          icon: "PhGear",
        },
        {
          path: "logout",
          title: t("sidebar.sideBarRoutes.other.logout"),
          icon: "PhSignOut",
        },
      ],
    },
  ]);

  const subRoutes = computed(() => [
    {
      path: "/dashboard/feedback",
      title: t("sidebar.sideBarRoutes.feedback"),
      icon: "PhChatText",
    },
    {
      path: "/dashboard/help",
      title: t("sidebar.sideBarRoutes.help"),
      icon: "PhQuestion",
    },
  ]);

  // 2. Optimized Active Route Lookup
  const activeRoute = computed(() => {
    // Flatten all nested children into a single searchable array
    const allRoutes = [
      ...navigationGroups.value.flatMap((group) => group.children),
      ...subRoutes.value,
    ];

    // 1. Filter out items that aren't valid paths (like the 'logout' action)
    // 2. Sort by path length (longest first) to ensure specific paths
    //    match before more general parent paths (e.g., /dashboard)
    const sortedRoutes = allRoutes
      .filter((r) => r.path.startsWith("/"))
      .sort((a, b) => b.path.length - a.path.length);

    // 3. Find the first route that the current path starts with
    const match = sortedRoutes.find((r) => route.path.startsWith(r.path));

    return (
      match || {
        title: "Dashboard",
        icon: "PhBrowser",
      }
    );
  });

  const getRouteTitles = (path: string): string[] => {
    // 1. Normalize path (remove trailing slash)
    const normalizedPath =
      path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;

    // 2. Build a flattened list of all paths and their associated title hierarchy
    const flattenedHierarchy: { path: string; titles: string[] }[] = [];

    navigationGroups.value.forEach((group) => {
      group.children.forEach((item) => {
        // Add the direct child (e.g., /dashboard/orders -> [Menu, Orders])
        flattenedHierarchy.push({
          path: item.path,
          titles: [group.title, item.title],
        });

        // Add deeply nested children if they exist
        if (item.children && Array.isArray(item.children)) {
          item.children.forEach((child) => {
            flattenedHierarchy.push({
              path: child.path,
              titles: [group.title, item.title, child.title],
            });
          });
        }
      });
    });

    // Add standalone sub-routes (e.g., Help, Feedback)
    subRoutes.value.forEach((route) => {
      flattenedHierarchy.push({
        path: route.path,
        titles: [route.title],
      });
    });

    // 3. Sort by path length (longest first) to ensure specificity
    // We filter for paths starting with '/' to skip actions like 'logout'
    const sortedHierarchy = flattenedHierarchy
      .filter((entry) => entry.path.startsWith("/"))
      .sort((a, b) => b.path.length - a.path.length);

    // 4. Find the first match that the current path starts with
    const match = sortedHierarchy.find((entry) =>
      normalizedPath.startsWith(entry.path),
    );

    if (match) return match.titles;

    // 5. Fallback for the base dashboard or unknown root segments
    if (normalizedPath.startsWith("/dashboard")) {
      return [
        t("sidebar.sideBarRoutes.menu.title"),
        t("sidebar.sideBarRoutes.menu.dashboard"),
      ];
    }

    return [];
  };

  const mobileNavigationItems = computed(() => [
    {
      path: "/dashboard",
      title: t("sidebar.sideBarRoutes.menu.dashboard"),
      icon: "PhChartPieSlice",
    },
    {
      path: "/dashboard/orders",
      title: t("sidebar.sideBarRoutes.menu.orders"),
      icon: "PhClipboardText",
    },
    {
      path: "/dashboard/wallet",
      title: t("sidebar.sideBarRoutes.menu.wallet"),
      icon: "PhWallet",
    },
    {
      path: "/dashboard/products",
      title: t("sidebar.sideBarRoutes.inventory.products"),
      icon: "PhStorefront",
    },
    {
      path: "/dashboard/profile/create-profile",
      title: t("sidebar.sideBarRoutes.other.profile"),
      icon: "PhUser",
    },
  ]);

  const mobileSideBar = computed(() => [
    {
      title: t("sidebar.sideBarRoutes.menu.title"),
      children: [
        {
          path: "/dashboard/users",
          title: t("sidebar.sideBarRoutes.menu.users"),
          icon: "PhUsers",
        },
        {
          path: "/dashboard/analytics",
          title: t("sidebar.sideBarRoutes.menu.analytics"),
          icon: "PhChartLine",
          //  children: [
          //    {
          //      path: "/dashboard/analytics/realtime",
          //      title: t("sidebar.sideBarRoutes.menu.overview"),
          //      icon: "PhChartPieSlice",
          //    },
          //  ],
        },
      ],
    },
    {
      title: t("sidebar.sideBarRoutes.inventory.title"),
      children: [
        {
          path: "/dashboard/categories",
          title: t("sidebar.sideBarRoutes.inventory.categories"),
          icon: "PhSquaresFour",
        },
        {
          path: "/dashboard/promo",
          title: t("sidebar.sideBarRoutes.inventory.promo"),
          icon: "PhSealPercent",
        },
      ],
    },
  ]);

  return {
    navigationGroups,
    mobileNavigationItems,
    subRoutes,
    activeRoute,
    getRouteTitles,
    mobileSideBar,
  };
};
