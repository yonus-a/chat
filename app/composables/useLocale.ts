import countries from "~/assets/data/countries.json";

export const useLocale = () => {
  const { locale, setLocale, locales } = useI18n();

  const localeToCountryMap: Record<string, string> = {
    en: "US",
    fa: "IR",
    ar: "AE",
  };

  // NEW: Computed list of all available languages with flags and country codes
  const languages = computed(() => {
    return locales.value.map((loc: any) => {
      const countryCode = localeToCountryMap[loc.code] || "US";

      return {
        ...loc,
        countryCode: countryCode.toUpperCase(),
        flag: `/flags/${countryCode.toLowerCase()}.svg`,
      };
    });
  });

  const currentCountry = computed(() => {
    const code = localeToCountryMap[locale.value] || "US";
    return (
      countries.find((c) => c.code.toUpperCase() === code) ||
      countries.find((c) => c.code === "IR")
    );
  });

  const flagUrl = computed(() => {
    return currentCountry.value
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
    // Reload only if necessary for direction changes, otherwise setLocale handles reactivity
    window.location.reload();
  };

  const otherLanguages = computed(() => {
    return languages.value.filter((lang) => lang.code !== locale.value);
  });

  const currentDirection = computed(() => {
    const activeLocale = locales.value.find(
      (l: any) => l.code === locale.value,
    );

    return activeLocale?.dir || "ltr";
  });

  onMounted(() => {
    setTimeout(() => {
      console.log(currentDirection.value);
    }, 200);
  });

  return {
    locale,
    otherLanguages,
    languages, // Added to return
    currentCountry,
    flagUrl,
    currentDirection,
    dir,
    switchLocale,
  };
};
