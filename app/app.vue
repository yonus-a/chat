<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
  <BToast ref="toastComponent" />
  <Teleport to="body">
    <CallPipOverlay />
  </Teleport>
</template>
<script setup lang="ts">
const { toastRef } = useAppToast()
import CallPipOverlay from './components/call/CallPipOverlay.vue';
const toastComponent = ref(null);
const chatStore = useChatStore()
const { dir, locale } = useLocale();
const { colorMode } = useTheme();
const { t } = useI18n()
useHead({
  titleTemplate: (titleChunk) => {
    const siteName = t('seo.siteName');
    return titleChunk ? `${siteName} - ${titleChunk}` : siteName;
  },
  htmlAttrs: {
    dir: dir,
    lang: locale,
  }
});
onMounted(() => {
  chatStore.fetchConversations('', 1)
  toastRef.value = toastComponent.value;
});
</script>