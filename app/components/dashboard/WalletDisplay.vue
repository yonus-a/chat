<template>
    <div ref="walletCardRef"
        class="bg-surface p-3 gap-y-3 md:gap-y-0 flex flex-col justify-between border border-outline-variant rounded-3xl h-full">
        <div class=" w-full rtl:pl-3 select-none ltr:pr-3 flex justify-between items-center">
            <div>
                <div v-loading="isLoading" class="  text-on-surface text-title-sm">{{ t('dashboard.wallet.title') }}
                </div>
                <div v-loading="isLoading" class=" text-body-sm text-on-surface/50 mt-4">{{
                    t('dashboard.wallet.availableBalance') }}</div>
                <div class=" flex text-on-surface items-center gap-x-2">
                    <div v-loading="isLoading" class=" text-head-sm ">{{ formatCurrency(animatedWalletBalance) }}</div>
                    <div v-loading="isLoading" class=" text-title-md">{{ t('dashboard.wallet.currency') }}</div>
                </div>
            </div>
            <div class=" w-20 h-20">
                <BImage v-loading="isLoading" :src="walletImage" no-loading
                    class=" w-full h-full max-w-full max-h-full min-w-full min-h-full" />
            </div>
        </div>

        <div class=" w-full py-4 px-3 rounded-xl bg-surface-variant md:flex-row flex-col gap-y-3 md:gap-y-0 flex md:justify-between md:items-center"
            v-loading="isLoading">
            <div v-for="(item, index) in coverageItems" :key="index"
                class=" md:w-auto w-full flex flex-row md:flex-col md:justify-start justify-between md:gap-y-1">
                <div class=" select-none text-on-surface/50 text-body-sm whitespace-nowrap">
                    {{ item.label }}
                </div>
                <div class=" flex select-none items-center gap-x-2 text-on-surface">
                    <div class=" text-title-md">{{ formatCurrency(item.value) }}</div>
                    <div class=" text-label-sm">{{ t('dashboard.wallet.currency') }}</div>
                </div>
            </div>
        </div>

        <div class=" mt-3 w-full flex justify-between items-center" v-loading="isLoading">
            <div class=" md:flex items-center hidden gap-x-3 select-none text-on-surface text-body-sm">
                <div class=" opacity-50">{{ t('dashboard.wallet.insuranceType') }}</div>
                <div>{{ insuranceType }}</div>
            </div>
            <NuxtLinkLocale class=" w-full md:basis-1/2 flex justify-end" to="/dashboard/financial/wallet">
                <BButton  left-icon="PhPlus" class=" md:min-w-auto min-w-full" :text="t('dashboard.wallet.deposit')" />
            </NuxtLinkLocale>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { useI18n } from '#imports';
import walletImage from '/images/dashboard/wallet-icon.svg'
import { formatCurrency } from '#imports';
import { useProfileStore } from '#imports';
import { useNumberLerp } from '~/composables/useNumberLerp';
export default defineComponent({
    name: 'WalletDisplay',
    setup() {
        const { t } = useI18n()
        const profileStore = useProfileStore()

        const walletBalance = computed(() => profileStore.userData.balance)
        const insuranceCoverage = computed(() => profileStore.insuranceCoverage)
        const charityCoverage = computed(() => profileStore.charityCoverage)
        const totalDiscounts = computed(() => profileStore.totalDiscounts)

        const isLoading = computed(() => profileStore.isLoading)
        const isLoaded = computed(() => profileStore.isLoaded)

        // Main Balance Animation
        const {
            animatedValue: animatedWalletBalance,
            elementRef: walletCardRef
        } = useNumberLerp(walletBalance, isLoaded);

        // Sub-values Animations (Using the same container ref to trigger simultaneously)
        const { animatedValue: animatedInsurance } = useNumberLerp(insuranceCoverage, isLoaded, walletCardRef);
        const { animatedValue: animatedCharity } = useNumberLerp(charityCoverage, isLoaded, walletCardRef);
        const { animatedValue: animatedDiscounts } = useNumberLerp(totalDiscounts, isLoaded, walletCardRef);

        const coverageItems = computed(() => [
            {
                label: t('dashboard.wallet.insuranceCoverage'),
                value: animatedInsurance.value
            },
            {
                label: t('dashboard.wallet.charityCoverage'),
                value: animatedCharity.value
            },
            {
                label: t('dashboard.wallet.totalDiscount'),
                value: animatedDiscounts.value
            }
        ]);

        const insuranceType = ref('تامین اجتماعی')

        return {
            t,
            formatCurrency,
            insuranceType,
            walletImage,
            animatedWalletBalance,
            walletCardRef,
            isLoading,
            coverageItems,
        }
    }
})
</script>