<template>
    <div></div>
</template>
<script lang="ts" setup>
import { useI18n } from '#imports';
const { t } = useI18n();

useSeoMeta({
    title: () => t('seo.dashboard.index.title'),
    description: () => t('seo.dashboard.index.description'),
    ogTitle: () => `${t('seo.siteName')} - ${t('seo.dashboard.index.title')}`,
});


</script>