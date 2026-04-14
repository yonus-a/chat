<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <BToast ref="toastComponent" />
  </div>
</template>
<script setup lang="ts">
const { toastRef } = useAppToast()
const toastComponent = ref(null);
const { t } = useI18n()
useHead({
  titleTemplate: (titleChunk) => {
    const siteName = t('seo.siteName');
    return titleChunk ? `${siteName} - ${titleChunk}` : siteName;
  }
});
onMounted(() => {
  toastRef.value = toastComponent.value;
});
</script>