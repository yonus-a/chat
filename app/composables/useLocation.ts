// app/composables/useLocation.ts
import { ref, computed, onMounted } from "vue";
import provincesData from "~/assets/data/provinces.json";
import citiesData from "~/assets/data/cities.json";
import type { ProvinceWithCities, Province, City } from "~/types/location";

export const useLocation = () => {
  // --- GPS State ---
  const coords = ref<{ latitude: number; longitude: number } | null>(null);
  const geoError = ref<string | null>(null);
  const permissionStatus = ref<PermissionState | "unknown">("unknown");

  // --- Dropdown State ---
  const selectedProvinceId = ref<number | null>(null);
  const selectedCityId = ref<number | null>(null);

  // --- Computed Data ---
  const provinces = computed<Province[]>(() => provincesData.provinces);

  const cities = computed<City[]>(() => {
    const province = (citiesData as ProvinceWithCities[]).find(
      (p) => p.id === selectedProvinceId.value,
    );
    return province ? province.cities : [];
  });

  // --- Methods ---

  const checkPermission = async () => {
    if (process.server || !navigator.permissions) return;
    try {
      // Refresh status
      const result = await navigator.permissions.query({
        name: "geolocation" as PermissionName,
      });
      permissionStatus.value = result.state;

      // Listen for changes (e.g. user changes browser settings while on page)
      result.onchange = () => {
        permissionStatus.value = result.state;
      };
    } catch (err) {
      permissionStatus.value = "unknown";
    }
  };

  const requestBrowserLocation = (): Promise<{
    latitude: number;
    longitude: number;
  }> => {
    return new Promise((resolve, reject) => {
      if (process.server || !navigator.geolocation) {
        geoError.value = "Geolocation not supported";
        reject(new Error(geoError.value));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Success Callback
          coords.value = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          permissionStatus.value = "granted";
          geoError.value = null;
          resolve(coords.value);
        },
        (err) => {
          // Error Callback
          if (err.code === 1) permissionStatus.value = "denied";
          geoError.value = err.message;
          reject(err);
        },
        { enableHighAccuracy: true, maximumAge: 0 },
      );
    });
  };

  const handleProvinceChange = (id: number) => {
    selectedProvinceId.value = id;
    selectedCityId.value = null;
  };

  // Initial check
  onMounted(() => {
    checkPermission();
  });

  const allCities = (citiesData as ProvinceWithCities[]).flatMap(
    (p) => p.cities,
  );
  const getCityById = (id: number) => allCities.find((c) => c.id === id);
  const getProvinceById = (id: number) =>
    provinces.value.find((p) => p.id === id);

  const findProvinceByName = (name: string) => {
    if (!name) return null;
    return provinces.value.find(
      (p) => name.includes(p.name) || p.name.includes(name),
    );
  };

  const findCityByName = (name: string) => {
    if (!name) return null;
    return allCities.find(
      (c) => name.includes(c.name) || c.name.includes(name),
    );
  };

  return {
    coords,
    geoError,
    permissionStatus,
    checkPermission,
    requestBrowserLocation,
    provinces,
    cities,
    selectedProvinceId,
    selectedCityId,
    handleProvinceChange,
    getProvinceById,
    getCityById,
    findProvinceByName,
    findCityByName,
  };
};
