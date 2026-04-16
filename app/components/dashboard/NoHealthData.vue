<template>
    <div class=" rounded-3xl bg-surface-variant h-56 p-6 gap-x-8 w-full flex items-center">
        <div class=" shrink-0 aspect-square h-full">
            <BImage :src="NoData" class=" w-full h-full min-w-full min-h-full max-w-full max-h-full" />
        </div>
        <div class=" text-on-surface flex-1 select-none h-full flex flex-col">
            <div class=" text-title-lg">{{ t('dashboard.cards.noData.title') }}</div>
            <div class=" text-label-md mt-3">{{ t('dashboard.cards.noData.description') }}</div>
            <div class=" mt-5">
                <BButton class=" min-w-48" :text="t('dashboard.cards.noData.start')" left-icon="PhPlus" />
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import NoData from '/images/dashboard/no-data.webp'
import { useI18n } from '#imports';
export default defineComponent({
    name: 'NoHealthData',
    setup() {
        const { t } = useI18n()


        return {
            t,
            NoData,
        }
    }
})
</script>