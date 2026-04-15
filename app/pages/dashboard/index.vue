<template>
    <div class=" flex flex-col gap-y-6 w-full">
        <DashboardGreetings />
    </div>
</template>
<script lang="ts" setup>
import { useI18n } from '#imports';
const { t } = useI18n();
import DashboardGreetings from '~/components/dashboard/DashboardGreetings.vue';

useSeoMeta({
    title: () => t('seo.dashboard.index.title'),
    description: () => t('seo.dashboard.index.description'),
    ogTitle: () => `${t('seo.siteName')} - ${t('seo.dashboard.index.title')}`,
});


</script>