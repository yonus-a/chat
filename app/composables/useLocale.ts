// app/composables/useLocale.ts

export const useLocale = () => {
  const { locale, setLocale, locales } = useI18n();

  const localeToCountryMap: Record<string, string> = {
    en: "US",
    fa: "IR",
    ar: "AE",
  };

  const localeTitles: Record<string, string> = {
    en: "English",
    fa: "فارسی",
    ar: "العربية",
  };

  const languages = computed(() => {
    return locales.value.map((loc: any) => {
      const countryCode = localeToCountryMap[loc.code] || "US";
      return {
        ...loc,
        title: localeTitles[loc.code] || loc.name || loc.code,
        countryCode: countryCode.toUpperCase(),
        flag: `/flags/${countryCode.toLowerCase()}.svg`,
      };
    });
  });

  // Updated currentCountry to include the native title
  const currentCountry = computed(() => {
    return (
      languages.value.find((lang) => lang.code === locale.value) ||
      languages.value
    );
  });

  const flagUrl = computed(() => {
    return currentCountry.value?.code
      ? `/flags/${currentCountry.value.code.toLowerCase()}.svg`
      : "";
  });

  const dir = computed(() => {
    const currentLocaleObj = locales.value.find(
      (l: any) => l.code === locale.value,
    );
    return currentLocaleObj?.dir || "ltr";
  });

  useHead({
    htmlAttrs: {
      dir: dir,
      lang: locale,
    },
  });

  const switchLocale = async (newLocale: string) => {
    await setLocale(newLocale);
    localStorage.setItem("user-locale", newLocale);
    window.location.reload();
  };

  const otherLanguages = computed(() => {
    return languages.value.filter((lang) => lang.code !== locale.value);
  });

  return {
    locale,
    languages,
    otherLanguages,
    currentCountry,
    flagUrl,
    dir,
    switchLocale,
  };
};
