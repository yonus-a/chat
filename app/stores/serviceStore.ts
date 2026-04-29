import { defineStore } from "pinia";
import { ref } from "vue";
import type { Contact } from "~/types/chat";
import type { Service } from "~/types/service";

export const useServiceStore = defineStore("service", () => {
  // --- State ---
  const isLoading = ref(false);
  const isLoadingServices = ref(false);
  const currentResultPage = ref(1);
  const searchText = ref("");
  const selectedServiceId = ref(-1);
  const providersPerPage = ref(10);
  const hasProviderNextPage = ref(true);

  const services = ref<Service[]>([]);

  // Initialize with "skeleton" objects at definition line using fill
  const providers = ref<Contact[]>(
    new Array(10).fill({
      id: -1,
      name: "...",
      lastName: "...",
      isOnline: false,
      lastSeen: new Date(),
      imageUrl: "",
      phoneNumber: "",
      isActive: false,
      birthDate: new Date(),
      serviceType: "chat",
      unreadCount: 0,
    } as Contact),
  );

  // --- Mocks ---
  const mockProviderBase = {
    firstNames: [
      "Amir",
      "Sara",
      "Mohammad",
      "Elena",
      "Mehdi",
      "Zahra",
      "Arash",
      "Niloufar",
    ],
    lastNames: [
      "Safari",
      "Rossi",
      "Ahmadi",
      "Bianchi",
      "Kermani",
      "Ricci",
      "Hosseini",
    ],
    images: [
      "https://i.pravatar.cc/150?u=1",
      "https://i.pravatar.cc/150?u=2",
      "https://i.pravatar.cc/150?u=3",
      "https://i.pravatar.cc/150?u=4",
      "https://i.pravatar.cc/150?u=5",
    ],
  };

  // --- Actions ---

  /**
   * Resets provider pagination and list
   */
  const resetProviderData = () => {
    // Restore the 10 skeletons so the Virtual List remains populated while loading
    providers.value = new Array(10).fill({
      id: -1,
      name: "...",
      lastName: "...",
      isOnline: false,
      lastSeen: new Date(),
      imageUrl: "",
      phoneNumber: "",
      isActive: false,
      birthDate: new Date(),
      serviceType: "chat",
      unreadCount: 0,
    } as Contact);

    currentResultPage.value = 1;
    hasProviderNextPage.value = true;
  };

  /**
   * Simulated Service Fetch
   */
  const fetchServices = async () => {
    isLoadingServices.value = true;

    // Simulate API Delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    services.value = [
      { id: 1, label: "پزشک قلب" },
      { id: 2, label: "پزشک متخصص ریه" },
      { id: 3, label: "متخصص ارتوپدی" },
      { id: 4, label: "متخصص مغز و اعصاب" },
      { id: 5, label: "متخصص گوش، حلق و بینی" },
      { id: 6, label: "چشم پزشک" },
    ];

    isLoadingServices.value = false;
  };
  /**
   * Simulated Provider Fetch with Pagination and Search
   */
  const fetchProviders = async (isLoadMore = false) => {
    if (isLoading.value || (!hasProviderNextPage.value && isLoadMore)) return;

    isLoading.value = true;

    if (!isLoadMore) {
      resetProviderData();
    }

    // Simulate API Delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Mocking an API response limit (stop at page 5)
    if (currentResultPage.value >= 5) {
      hasProviderNextPage.value = false;
      isLoading.value = false;
      return;
    }

    const newProviders: Contact[] = Array.from({
      length: providersPerPage.value,
    }).map((_, index) => {
      const randomId = Math.floor(Math.random() * 10000);
      const hasImage = Math.random() > 0.2; // 80% have images

      const contact: Contact = {
        id: randomId,
        name: mockProviderBase.firstNames[
          Math.floor(Math.random() * mockProviderBase.firstNames.length)
        ],
        lastName:
          mockProviderBase.lastNames[
            Math.floor(Math.random() * mockProviderBase.lastNames.length)
          ],
        isOnline: Math.random() > 0.5,
        lastSeen: new Date(),
        imageUrl: hasImage
          ? mockProviderBase.images[
              Math.floor(Math.random() * mockProviderBase.images.length)
            ]
          : "",
        phoneNumber: "0913" + Math.floor(1000000 + Math.random() * 9000000),
        isActive: true,
        birthDate: new Date(1990, 0, 1),
        unreadCount: 0,
        serviceType: ["video-call", "voice-call", "chat"][
          Math.floor(Math.random() * 3)
        ] as any,
      };

      // Randomly strip the imageUrl key entirely for some to test "missing key" logic
      if (!hasImage && Math.random() > 0.5) {
        delete (contact as any).imageUrl;
      }

      return contact;
    });

    if (currentResultPage.value === 1) {
      providers.value = newProviders;
    } else {
      providers.value = [...providers.value, ...newProviders];
    }
    currentResultPage.value++;
    isLoading.value = false;
  };

  return {
    isLoading,
    isLoadingServices,
    currentResultPage,
    searchText,
    selectedServiceId,
    providersPerPage,
    hasProviderNextPage,
    services,
    providers,
    fetchServices,
    fetchProviders,
    resetProviderData,
  };
});
