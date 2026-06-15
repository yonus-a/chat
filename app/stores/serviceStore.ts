import { defineStore } from "pinia";
import { ref } from "vue";
import type { Provider, Service, Fellowship } from "~/types/service";
import type { Clinic } from "~/types/clinic";

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

  // Helper to create a skeleton Provider
  const createSkeletonProvider = (): Provider => ({
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
    expertise: "...",
    type: "public",
    service: {} as Service,
    clinics: [],
    fellowships: [],
  });

  const providers = ref<Provider[]>(
    new Array(10).fill(null).map(createSkeletonProvider),
  );

  // --- Mocks ---
  const mockFellowships: Fellowship[] = [
    { id: 101, title: "فلوشیپ اینترونشنال کاردیولوژی" },
    { id: 102, title: "فلوشیپ اکوکاردیوگرافی" },
    { id: 103, title: "فلوشیپ جراحی زانو" },
    { id: 104, title: "فلوشیپ سم‌شناسی" },
  ];

  const mockClinics: Clinic[] = [
    { id: 501, title: 120, latitude: 35.7219, longitude: 51.3347 }, // Title as number per your type
    { id: 502, title: 130, latitude: 35.7, longitude: 51.4 },
  ];

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

  const resetProviderData = () => {
    providers.value = new Array(10).fill(null).map(createSkeletonProvider);
    currentResultPage.value = 1;
    hasProviderNextPage.value = true;
  };

  const fetchServices = async () => {
    isLoadingServices.value = true;
    await new Promise((resolve) => setTimeout(resolve, 800));

    services.value = [
      {
        id: 1,
        label: "پزشک قلب",
        expertiseLevel: "speciality",
        fellowships: [mockFellowships[0]!, mockFellowships[1]!],
        price: 100000,
      },
      {
        id: 2,
        label: "پزشک متخصص ریه",
        expertiseLevel: "speciality",
        fellowships: [],
        price: 200000,
      },
      {
        id: 3,
        label: "متخصص ارتوپدی",
        expertiseLevel: "sub-speciality",
        fellowships: [mockFellowships[2]!],
        price: 300000,
      },
      {
        id: 4,
        label: "متخصص مغز و اعصاب",
        expertiseLevel: "speciality",
        fellowships: [],
        price: 100000,
      },
      {
        id: 5,
        label: "متخصص گوش، حلق و بینی",
        expertiseLevel: "speciality",
        fellowships: [],
        price: 200000,
      },
      {
        id: 6,
        label: "چشم پزشک",
        expertiseLevel: "speciality",
        fellowships: [mockFellowships[3]!],
        price: 400000,
      },
    ];

    isLoadingServices.value = false;
  };

  /**
   * Updated Provider Fetch with specific Service ID and Search String
   */
  const fetchProviders = async (
    isLoadMore = false,
    serviceId?: number,
    searchString?: string,
  ) => {
    if (isLoading.value || (!hasProviderNextPage.value && isLoadMore)) return;

    isLoading.value = true;
    const effectiveServiceId = serviceId ?? selectedServiceId.value;

    if (!isLoadMore) {
      resetProviderData();
    }

    await new Promise((resolve) => setTimeout(resolve, 1200));

    if (currentResultPage.value >= 5) {
      hasProviderNextPage.value = false;
      isLoading.value = false;
      return;
    }

    // Fix: Ensure we have a valid service object even if the state is empty
    let currentService = services.value.find(
      (s) => s.id === effectiveServiceId,
    );

    if (!currentService) {
      // Fallback to a default mock service so fellowships aren't empty during testing
      currentService = {
        id: 1,
        label: "پزشک قلب",
        expertiseLevel: "speciality",
        fellowships: [mockFellowships[0]!, mockFellowships[1]!],
      };
    }

    const newProviders: Provider[] = Array.from({
      length: providersPerPage.value,
    }).map(() => {
      const randomId = Math.floor(Math.random() * 10000);
      return {
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
        imageUrl:
          mockProviderBase.images[
            Math.floor(Math.random() * mockProviderBase.images.length)
          ],
        phoneNumber: "0913" + Math.floor(1000000 + Math.random() * 9000000),
        isActive: true,
        birthDate: new Date(1990, 0, 1),
        unreadCount: 0,
        serviceType: "chat",
        // Provider fields
        expertise: currentService!.label,
        type: "public",
        service: currentService!,
        clinics: [mockClinics[0]!],
        fellowships: currentService!.fellowships, // This will no longer be empty
      };
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
