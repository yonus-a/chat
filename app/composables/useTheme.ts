export const useTheme = () => {
  const colorMode = useColorMode();

  useHead({
    htmlAttrs: {
      class: computed(() => colorMode.value)
    }
  });

  const toggleTheme = () => {
    colorMode.preference = colorMode.value === 'light' ? 'dark' : 'light';
  };

  return {
    colorMode,
    toggleTheme
  };
};