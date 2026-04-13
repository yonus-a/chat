import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useRouter, useCookie, useValidation } from "#imports";

export const useAuthStore = defineStore("auth", () => {
  const { toEnglishNumbers } = useValidation();
  const router = useRouter();

  // Persistent state using cookies to survive page refreshes
  const token = useCookie("auth_token", { maxAge: 60 * 60 * 24 * 7 });
  const loginIdentifier = useCookie("auth_identifier", { maxAge: 60 * 30 });
  const isRegistering = useCookie<boolean>("auth_is_reg", { maxAge: 60 * 30 });

  // Local state
  const user = ref<any>(null);
  const isRequesting = ref(false);
  const timers = ref<Record<string, number>>({});

  const STORAGE_KEY = "auth_otp_timers";

  const saveTimersToStorage = () => {
    if (process.client) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(timers.value));
    }
  };

  const loadTimersFromStorage = () => {
    if (process.client) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          timers.value = JSON.parse(stored);
        } catch (e) {
          timers.value = {};
        }
      }
    }
  };

  const isLoggedIn = computed(() => !!token.value);

  const getRemainingTime = (identifier: string): number => {
    if (!identifier) return 0;
    const cleanId = toEnglishNumbers(identifier.trim());
    const expiry = timers.value[cleanId];
    if (!expiry) return 0;

    const remaining = Math.ceil((expiry - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  };

  const setLoginData = (val: string, registering: boolean = false) => {
    const cleanId = toEnglishNumbers(val.trim());
    loginIdentifier.value = cleanId;
    isRegistering.value = registering;
  };

  const requestOtp = async () => {
    const id = loginIdentifier.value;
    if (!id) return false;

    // Do not request if a valid timer exists
    if (getRemainingTime(id) > 0) return true;

    try {
      isRequesting.value = true;
      // API call placeholder
      // await $fetch('/api/auth/otp/send', { method: 'POST', body: { phone: id } });

      // Set 120 seconds expiry
      timers.value[id] = Date.now() + 60000;
      saveTimersToStorage();
      return true;
    } catch (error) {
      return false;
    } finally {
      isRequesting.value = false;
    }
  };

  const logout = () => {
    token.value = null;
    loginIdentifier.value = null;
    isRegistering.value = false;
    router.push("/auth");
  };

  const resetLoginData = () => {
    loginIdentifier.value = null;
    isRegistering.value = false;
  };

  if (process.client) {
    loadTimersFromStorage();
  }

  return {
    loginIdentifier,
    token,
    resetLoginData,
    isRequesting,
    isLoggedIn,
    isRegistering,
    setLoginData,
    requestOtp,
    getRemainingTime,
    logout,
  };
});
