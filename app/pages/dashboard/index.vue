<template>
    <div class="flex flex-col gap-y-6 w-full">
        <DashboardGreetings />

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full gap-4">
            <HealthStatus v-for="healthState in healthCardProps" :key="healthState" :type="healthState" />
        </div>
        <div class=" w-full flex gap-x-4 ">
            <div class=" basis-1/2">
                <HealthScore />
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { useI18n } from '#imports';
const { t } = useI18n();
import DashboardGreetings from '~/components/dashboard/DashboardGreetings.vue';
import HealthScore from '~/components/dashboard/HealthScore.vue';
import HealthStatus from '~/components/dashboard/HealthStatus.vue';
const healthCardProps = ['all', 'social', 'physical', 'mental']


useSeoMeta({
    title: () => t('seo.dashboard.index.title'),
    description: () => t('seo.dashboard.index.description'),
    ogTitle: () => `${t('seo.siteName')} - ${t('seo.dashboard.index.title')}`,
});


</script>