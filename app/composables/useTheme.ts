import logoDark from '@/assets/images/logo/logo-dark.svg';
import logoLight from '@/assets/images/logo/logo-light.svg';

export const useTheme = () => {
  const colorMode = useColorMode();

  useHead({
    htmlAttrs: {
      class: computed(() => colorMode.value)
    }
  });

  // FIXED LOGIC: 
  // If theme is 'light' (white bg), use 'logoDark'
  // If theme is 'dark' (dark bg), use 'logoLight'
  const displayedLogo = computed(() => (colorMode.value !== 'light' ? logoDark : logoLight));

  const toggleTheme = () => {
    colorMode.preference = colorMode.value === 'light' ? 'dark' : 'light';
  };

  return {
    colorMode,
    displayedLogo,
    toggleTheme
  };
};