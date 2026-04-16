<template>
    <div class="flex flex-col gap-y-3.5 md:gap-y-6 w-full">
        <DashboardGreetings class=" md:flex hidden" />

        <div class="grid grid-cols-2 lg:grid-cols-4 w-full gap-3 md:gap-4">
            <HealthStatus v-for="healthState in healthCardProps" :key="healthState" :type="healthState" />
        </div>
        <div class=" w-full items-stretch md:flex-row flex-col-reverse flex gap-y-3 md:gap-y-0 gap-x-0 md:gap-x-4 ">
            <div class=" md:basis-1/2">
                <WalletDisplay />
            </div>
            <div class=" md:basis-1/2">
                <HealthScore />
            </div>
        </div>
        <div class=" md:grid grid-cols-3 flex flex-col md:gap-y-0 gap-y-3 md:gap-x-4">
            <DashboardServices v-for="(service, index) in serviceTabTypes" :key="index" :type="service" />
        </div>
    </div>
</template>
<script lang="ts" setup>
import { useI18n } from '#imports';
const { t } = useI18n();
import DashboardGreetings from '~/components/dashboard/DashboardGreetings.vue';
import HealthScore from '~/components/dashboard/HealthScore.vue';
import WalletDisplay from '~/components/dashboard/WalletDisplay.vue';
import HealthStatus from '~/components/dashboard/HealthStatus.vue';
import DashboardServices from '~/components/dashboard/DashboardServices.vue';
const healthCardProps = ['all', 'social', 'physical', 'mental'];
const serviceTabTypes = ['history', 'special', 'screening']


useSeoMeta({
    title: () => t('seo.dashboard.index.title'),
    description: () => t('seo.dashboard.index.description'),
    ogTitle: () => `${t('seo.siteName')} - ${t('seo.dashboard.index.title')}`,
});


</script>