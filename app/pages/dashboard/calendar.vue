<template>
    <div class=" w-full h-full max-h-full flex flex-col">
        <CalendarHeader @update:mode="handleModeUpdate" @update:range="handleRangeUpdate" />
        <div class=" w-full flex-1 ">
            <CalendarGrid :range="currentRange" />
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useI18n, useSeoMeta } from '#imports';
import CalendarHeader from '~/components/calendar/CalendarHeader.vue';
import CalendarGrid from '~/components/calendar/CalendarGrid.vue';
definePageMeta({
    layout: 'dashboard',
    title: 'seo.dashboard.calendar.title'
})

export default defineComponent({
    name: 'CalendarPage',
    components: {
        CalendarHeader,
        CalendarGrid,
    },
    setup() {
        const { t } = useI18n()


        const currentRange = ref<{ start: Date; end: Date } | null>(null);


        const handleRangeUpdate = (range: { start: Date; end: Date }) => {
            currentRange.value = range;
            console.log('New Range Received:', {
                start: range.start.toLocaleString(),
                end: range.end.toLocaleString()
            });
        };

        const handleModeUpdate = (mode: 'daily' | 'weekly' | 'monthly') => {
            console.log(mode)
        }


        useSeoMeta({
            title: () => t('seo.dashboard.calendar.title'),
            description: () => t('seo.dashboard.calendar.description'),
            ogTitle: () => `${t('seo.siteName')} - ${t('seo.dashboard.calendar.title')}`,
        });




        return {
            handleModeUpdate,
            handleRangeUpdate,
            t,
            currentRange,
        }
    }
})

</script>