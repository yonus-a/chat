<template>
    <div class="bg-surface p-3 flex flex-col justify-between border border-outline-variant  rounded-3xl h-full">
        <div class=" w-full rtl:pl-3 select-none ltr:pr-3 flex justify-between items-center">
            <div>
                <div v-loading="isLoading" class="  text-on-surface text-title-sm">{{ t('dashboard.wallet.title') }}
                </div>
                <div v-loading="isLoading" class=" text-body-sm text-on-surface/50 mt-4">{{
                    t('dashboard.wallet.availableBalance') }}</div>
                <div class=" flex text-on-surface items-center gap-x-2">
                    <div v-loading="isLoading" class=" text-head-sm ">{{ formatCurrency(walletBalance) }}</div>
                    <div v-loading="isLoading" class=" text-title-md">{{ t('dashboard.wallet.currency') }}</div>
                </div>
            </div>
            <div class=" w-20 h-20">
                <BImage v-loading="isLoading" :src="walletImage" no-loading
                    class=" w-full h-full max-w-full max-h-full min-w-full min-h-full" />
            </div>
        </div>
        <div v-loading="isLoading">
            <NuxtLinkLocale to="/dashboard/financial/wallet">
                <BButton left-icon="PhPlus" :text="t('dashboard.wallet.deposit')" />
            </NuxtLinkLocale>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from '#imports';
import walletImage from '/images/dashboard/wallet-icon.svg'
import { formatCurrency } from '#imports';
import { useProfileStore } from '#imports';
export default defineComponent({
    name: 'WalletDisplay',
    setup() {
        const { t } = useI18n()
        const profileStore = useProfileStore()
        const walletBalance = computed(() => profileStore.userData.balance)
        const isLoading = computed(() => profileStore.isLoading)


        return {
            t,
            formatCurrency,
            walletBalance,
            walletImage,
            isLoading,
        }
    }
})
</script>