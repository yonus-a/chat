import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useI18n, useCookie } from "#imports";

export type UserRoleKey = "user" | "employee" | "business" | "support";

export interface RoleDetail {
  label: string;
  key: UserRoleKey;
}

export const useProfileStore = defineStore("profile", () => {
  const { t } = useI18n();

  // 1. Initialize the Cookie
  // maxAge is set to 30 days
  const chosenRoleCookie = useCookie<UserRoleKey>("auth_chosen_role", {
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  // --- State ---
  const isLoading = ref(true);
  const isLoaded = ref(false);
  const userRoles = ref<UserRoleKey[]>(["user"]);

  // 2. Sync state with Cookie on initialization
  const chosenRole = ref<UserRoleKey>(chosenRoleCookie.value || "user");

  const userData = ref({
    name: "",
    lastName: "",
    nationality: "iranian",
    nationalId: "",
    imageUrl: "",
    gender: "",
    birthDate: null as Date | null,
  });

  // --- Static Metadata ---
  const allRoleDetails = computed<RoleDetail[]>(() => [
    { label: t("general.roles.user"), key: "user" },
    { label: t("general.roles.employee"), key: "employee" },
    { label: t("general.roles.business"), key: "business" },
    { label: t("general.roles.support"), key: "support" },
  ]);

  // --- Getters ---
  const availableRoles = computed(() => {
    return allRoleDetails.value.filter((role) =>
      userRoles.value.includes(role.key),
    );
  });

  const currentRole = computed(() => {
    return (
      allRoleDetails.value.find((role) => role.key === chosenRole.value) ||
      allRoleDetails.value
    );
  });

  const otherRoles = computed(() => {
    return availableRoles.value.filter((role) => role.key !== chosenRole.value);
  });

  // --- Actions ---

  /**
   * Switches the role, persists it to the cookie, and reloads the page.
   * A hard reload ensures all layout-level logic and navigation guards
   * re-evaluate based on the new role.
   */
  const switchRole = (roleKey: UserRoleKey) => {
    if (!userRoles.value.includes(roleKey)) {
      console.error(`Unauthorized role switch attempt: ${roleKey}`);
      return;
    }

    // Update Store
    chosenRole.value = roleKey;

    // Update Cookie
    chosenRoleCookie.value = roleKey;

    // Refresh the page
    if (process.client) {
      window.location.reload();
    }
  };

  const loadUserProfile = async () => {
    if (isLoaded.value) return;
    isLoading.value = true;
    try {
      // Simulate API
      await new Promise((resolve) => setTimeout(resolve, 800));

      userData.value = {
        name: "امیر",
        lastName: "صفری",
        nationality: "iranian",
        nationalId: "1234567890",
        gender: "male",
        imageUrl:'imageUrl',
        birthDate: new Date("1999-11-25T00:00:00Z"),
      };

      // Assume backend returns these roles
      userRoles.value = ["user", "business"];
      isLoaded.value = true;
    } catch (error) {
      console.error(error);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    userData,
    userRoles,
    chosenRole,
    isLoading,
    isLoaded,
    availableRoles,
    currentRole,
    otherRoles,
    loadUserProfile,
    switchRole,
  };
});
