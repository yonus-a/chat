import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type {
  UserRoleKey,
  Profile,
  RoleDetail,
  FamilyMember,
} from "@/types/profile";
import type { Contact } from "@/types/chat";
import type { Address } from "@/types/address";
import citiesData from "@/assets/data/cities.json";
import type { ProvinceWithCities } from "@/types/address";

const blankProfile = "/images/dashboard/blank-profile.webp";

export const useProfileStore = defineStore("profile", () => {
  // Simple t() replacement for standalone use
  const t = (key: string) => key;

  // Cookie replacement using localStorage
  const getStoredRole = (): UserRoleKey => {
    try {
      return (localStorage.getItem("auth_chosen_role") as UserRoleKey) || "employee";
    } catch {
      return "employee";
    }
  };
  const setStoredRole = (role: UserRoleKey) => {
    try {
      localStorage.setItem("auth_chosen_role", role);
    } catch {}
  };

  // --- State ---
  const isLoading = ref(true);
  const isLoaded = ref(false);
  const userRoles = ref<UserRoleKey[]>(["user"]);
  const insuranceCoverage = ref(300000);
  const charityCoverage = ref(300000);
  const totalDiscounts = ref(300000);

  const isLoadingAddresses = ref(false);
  const addresses = ref<Address[]>([]);
  const isAddressesLoaded = ref(false);
  // 2. Sync state with Cookie on initialization
  const chosenRole = ref<UserRoleKey>(getStoredRole());

  const userData = ref<Profile>({
    id: 1,
    name: "",
    lastName: "",
    nationality: "iranian",
    nationalId: "",
    imageUrl: "",
    phoneNumber: "",
    gender: null,
    birthDate: null as Date | null,
    balance: 1000000,
    referral: {
      id: 1,
      date: new Date(),
      priority: "high",
      service: {
        id: 1,
        label: "پزشک قلب",
        expertiseLevel: "speciality",
        fellowships: [],
        price: 100000,
      },
    },
  });

  const isFamilyMembersLoaded = ref(false);
  const isLoadingFamilyMembers = ref(false);
  const familyMembers = ref<FamilyMember[]>([]);

  const loadFamilyMembers = async () => {
    if (isFamilyMembersLoaded.value) return;
    isLoadingFamilyMembers.value = true;
    try {
      // Simulate network delay (1 second)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generate 3 mock family members
      const mockMembers: FamilyMember[] = [
        {
          id: 1,
          name: "سارا",
          lastName: "صفری",
          isOnline: false,
          lastSeen: new Date(),
          imageUrl: "https://i.pravatar.cc/150?u=2",
          isActive: true,
          birthDate: new Date("1990-03-15"),
          phoneNumber: "09123456789",
          nationalCode: "1234567890",
          relation: "mother",
          isHeadOfHousehold: true,
          livesWithMe: true,
          userType: ["user"],
        },
        {
          id: 2,
          name: "رضا",
          lastName: "صفری",
          isOnline: true,
          lastSeen: new Date(),
          imageUrl: "https://i.pravatar.cc/150?u=3",
          isActive: true,
          birthDate: new Date("2015-07-20"),
          relation: "child",
          isHeadOfHousehold: false,
          livesWithMe: true,
          userType: ["user"],
        },
        {
          id: 3,
          name: "مریم",
          lastName: "احمدی",
          isOnline: false,
          lastSeen: new Date(),
          imageUrl: "https://i.pravatar.cc/150?u=4",
          isActive: false,
          birthDate: new Date("1988-12-02"),
          relation: "spouse",
          isHeadOfHousehold: false,
          livesWithMe: true,
          userType: ["user"],
        },
      ];

      familyMembers.value = mockMembers;
      isFamilyMembersLoaded.value = true;
    } catch (error) {
      console.error("Failed to load family members:", error);
    } finally {
      isLoadingFamilyMembers.value = false;
    }
  };

  /// const familyMembers = ref<Contact[]>([
  ///   {
  ///     id: 1,
  ///     name: "امیر",
  ///     lastName: "سعیدی",
  ///     isOnline: true,
  ///     lastSeen: new Date(),
  ///     imageUrl: "https://i.pravatar.cc/150?u=1",
  ///     isActive: false,
  ///     unreadCount: 2,
  ///     serviceType: "chat",
  ///     birthDate: new Date(),
  ///     phoneNumber: "09134168227",
  ///     nationalCode: "1235678901",
  ///   },
  ///   {
  ///     id: 2,
  ///     name: "امیر",
  ///     lastName: "سعیدی",
  ///     isOnline: true,
  ///     lastSeen: new Date(),
  ///     imageUrl: "https://i.pravatar.cc/150?u=1",
  ///     isActive: false,
  ///     unreadCount: 2,
  ///     serviceType: "chat",
  ///     birthDate: new Date(),
  ///     phoneNumber: "09134168227",
  ///     nationalCode: "1235678901",
  ///   },
  /// ]);

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
    setStoredRole(roleKey);

    // Refresh the page
    window.location.reload();
  };

  const loadUserProfile = async () => {
    if (isLoaded.value) return;
    isLoading.value = true;
    try {
      // Simulate API
      await new Promise((resolve) => setTimeout(resolve, 800));

      userData.value = {
        id: 1,
        name: "امیر",
        lastName: "صفری",
        nationality: "iranian",
        nationalId: "1234567890",
        gender: "male",
        imageUrl: "",
        phoneNumber: "09133877121",
        birthDate: new Date("1999-11-25T00:00:00Z"),
        balance: 1000000,
        referral: {
          id: 1,
          date: new Date(),
          priority: "high",
          service: {
            id: 1,
            label: "پزشک قلب",
            expertiseLevel: "speciality",
            fellowships: [],
            price: 100000,
          },
        },
      };

      if (userData.value.imageUrl.trim().length === 0) {
        userData.value.imageUrl = blankProfile;
      }

      // Assume backend returns these roles
      userRoles.value = ["user", "business"];
      isLoaded.value = true;
    } catch (error) {
      console.error(error);
    } finally {
      isLoading.value = false;
    }
  };

  const loadAddresses = async () => {
    if (isAddressesLoaded.value) return;
    isLoadingAddresses.value = true;
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const provinces = citiesData as ProvinceWithCities[];
      const mockAddresses: Address[] = [];

      // Generate 3 mock addresses
      for (let i = 0; i < 3; i++) {
        // Pick a random province
        const randomProvince =
          provinces[Math.floor(Math.random() * provinces.length)];
        // Pick a random city in that province
        const randomCity =
          randomProvince.cities[
            Math.floor(Math.random() * randomProvince.cities.length)
          ];

        mockAddresses.push({
          id: i + 1,
          date: new Date().toISOString(),
          longitude: "0",
          latitude: "0",
          title: randomCity.name,
          path: `انتهای بلوار جهاد - خیابان یاسین - کوچه ۱۰`,
          postalCode: "1234567890",
          cityId: randomCity.id,
          provinceId: randomProvince.id,
          isMain: i === 0,
        });
      }

      addresses.value = mockAddresses;
      isAddressesLoaded.value = true;
    } catch (error) {
      console.error("Failed to load addresses:", error);
    } finally {
      isLoadingAddresses.value = false;
    }
  };

  const getFamilyMembersByIds = (ids?: number[]) => {
    if (!ids || ids.length === 0) return [];
    return familyMembers.value.filter((member) => ids.includes(member.id));
  };

  return {
    userData,
    getFamilyMembersByIds,
    userRoles,
    chosenRole,
    isLoading,
    charityCoverage,
    totalDiscounts,
    isLoadingAddresses,
    insuranceCoverage,
    isLoaded,
    availableRoles,
    isLoadingFamilyMembers,
    isFamilyMembersLoaded,
    familyMembers,
    loadFamilyMembers,
    currentRole,
    otherRoles,
    isAddressesLoaded,
    loadUserProfile,
    switchRole,
    loadAddresses,
    addresses,
  };
});
