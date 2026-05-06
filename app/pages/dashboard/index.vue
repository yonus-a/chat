<template>
    <div class="flex px-3 md:px-8 md:py-0 py-6 flex-col max-h-fullh-full gap-y-3.5 md:gap-y-6 w-full">
        <DashboardGreetings class=" md:flex hidden" />
        <ReferralNoticeDisplay v-if="profileStore.userData.referral" />
        <div v-if="hasData || isLoadingHealthData" class="grid grid-cols-2  md:grid-cols-3 w-full gap-3 md:gap-4">
            <HealthStatus v-for="(healthState, index) in healthCardProps" :key="healthState" :type="healthState"
                :class="{ 'col-span-2 md:col-span-1': index === 0 }" />
        </div>
        <NoHealthData v-else />
        <div class=" md:grid grid-cols-3 flex flex-col md:gap-y-0 gap-y-3 md:gap-x-4">
            <DashboardServices v-for="(service, index) in serviceTabTypes" :key="index" :type="service" />
        </div>
        <div class=" w-full items-stretch md:flex-row flex-col-reverse flex gap-y-3 md:gap-y-0 gap-x-0 md:gap-x-4 ">
            <div class=" md:basis-1/2">
                <WalletDisplay />
            </div>
            <div class=" md:basis-1/2">
                <HealthScore />
            </div>
        </div>
        <div class=" w-full pb-4 md:pb-0"></div>
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
import NoHealthData from '~/components/dashboard/NoHealthData.vue';
import ReferralNoticeDisplay from '~/components/dashboard/ReferralNoticeDisplay.vue';
const healthCardProps = ['social', 'physical', 'mental'];
const serviceTabTypes = ['consulting', 'special', 'history'];
const healthStore = useHealthStore()
const profileStore = useProfileStore()
const hasData = computed(() => healthStore.hasData)
const isLoadingHealthData = computed(() => healthStore.categories.all.loading)

definePageMeta({
    layout: 'dashboard',
    title: 'seo.dashboard.index.title'
})

useSeoMeta({
    title: () => t('seo.dashboard.index.title'),
    description: () => t('seo.dashboard.index.description'),
    ogTitle: () => `${t('seo.siteName')} - ${t('seo.dashboard.index.title')}`,
});


</script>