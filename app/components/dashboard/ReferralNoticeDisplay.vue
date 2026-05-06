<template>
    <div
        class=" flex rounded-3xl border bg-surface-variant  border-outline-variant items-stretch px-2 py-4 md:gap-x-3 gap-x-2 w-full select-none">
        <div class=" h-full min-h-full max-h-full ">
            <div class=" h-full min-h-full md:w-2 w-1 rounded-full shrink-0" :class="[color?.fill]"></div>
        </div>
        <div
            class=" flex rtl:pl-4 ltr:pr-4 md:flex-row flex-1 flex-col justify-center items-start md:items-center  gap-y-3 md:gap-y-0 md:justify-between ">
            <div class=" flex flex-col gap-y-2">
                <div v-loading="isLoading" class=" text-title-md text-on-surface">{{ t('dashboard.referral.title', {
                    field:
                        referral?.service.label
                }) }}</div>
                <i18n-t v-loading="isLoading" keypath="dashboard.referral.priority" tag="span"
                    class=" text-label-md text-on-surface/50">
                    <template #priority>
                        <span :class="[color?.text, 'text-body-sm']">{{ title }}</span>
                    </template>
                </i18n-t>
            </div>
            <div v-loading="isLoading">
                <NuxtLinkLocale :to="reserveRoute">
                    <BButton :text="t('dashboard.referral.reserve')" />
                </NuxtLinkLocale>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n, useServiceStore, useProfileStore } from '#imports';

export default defineComponent({
    name: 'ReferralNoticeDisplay',
    setup() {
        const { t } = useI18n()
        const profileStore = useProfileStore()
        const serviceStore = useServiceStore()
        const isLoading = computed(() => profileStore.isLoading)
        const referral = computed(() => profileStore.userData.referral)

        const title = computed(() => t(`dashboard.referral.priorities.${referral.value?.priority}`))

        const color = computed(() => {
            let priority = referral.value?.priority
            switch (priority) {
                case 'high':
                    return {
                        fill: "bg-diamond-error",
                        text: "text-error",
                    }
                case 'medium':
                    return {
                        fill: "bg-diamond-warning",
                        text: "text-warning",
                    }
                case 'low':
                    return {
                        fill: "bg-diamond-primary-secondary",
                        text: "text-primary",
                    }
            }
        })

        const reserveRoute = computed(() => ({
            path: '/dashboard/reserve',
            query: {
                id: referral.value?.service.id,
                label: referral.value?.service.label,
                icon: referral.value?.service.icon
            }
        }))

        return {
            isLoading,
            referral,
            title,
            color,
            reserveRoute,
            t,
        }
    }
})
</script>