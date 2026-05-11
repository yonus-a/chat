<template>
    <div class=" w-full h-full max-h-full flex flex-col">
        <CalendarHeader @add="openEventDetails" @refresh="refreshCalendar" @share="openSharePopup"
            @update:mode="handleModeUpdate" @update:range="handleRangeUpdate" />
        <div class=" w-full overflow-hidden flex-1 ">
            <CalendarGrid :range="currentRange" :mode="currentMode" />
        </div>
        <SharePopup ref="sharePopup" />
        <MainPopup ref="eventPopup" />
    </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useI18n, useSeoMeta, useCalendarStore } from '#imports';
import CalendarHeader from '~/components/calendar/CalendarHeader.vue';
import CalendarGrid from '~/components/calendar/grid/CalendarGrid.vue';
import SharePopup from '~/components/calendar/SharePopup.vue';
import type { Popup } from '~/types/components/popup';
import type { CalendarEvent } from '~/types/components/calendar';
import MainPopup from '~/components/calendar/event-management/MainPopup.vue';
definePageMeta({
    layout: 'dashboard',
    title: 'seo.dashboard.calendar.title'
})

export default defineComponent({
    name: 'CalendarPage',
    components: {
        MainPopup,
        CalendarHeader,
        CalendarGrid,
        SharePopup,
    },
    setup() {
        const { t } = useI18n()
        const calendarStore = useCalendarStore()

        const eventPopup = ref<Popup | null>(null)
        const sharePopup = ref<Popup | null>(null)

        const events = ref<CalendarEvent[]>([]);


        const openEventDetails = () => {
            eventPopup.value?.open()
        }

        const currentRange = ref<{ start: Date; end: Date } | null>(null);
        const currentMode = ref('monthly')

        const generateMockEvents = () => {
            if (!currentRange.value) return;

            const mockData: CalendarEvent[] = [];
            const startTime = currentRange.value.start.getTime();
            const endTime = currentRange.value.end.getTime();

            // Adjust count based on mode for visual density
            const eventCount = currentMode.value === 'daily' ? 4 : currentMode.value === 'weekly' ? 12 : 30;

            for (let i = 0; i < eventCount; i++) {
                // Pick a random timestamp within the range
                const randomStartTimestamp = startTime + Math.random() * (endTime - startTime);
                const startDate = new Date(randomStartTimestamp);

                // Random duration between 30 mins and 3 hours
                const randomDurationMs = (Math.floor(Math.random() * 5) + 1) * 30 * 60 * 1000;
                const endDate = new Date(startDate.getTime() + randomDurationMs);

                mockData.push({
                    id: Math.floor(Math.random() * 100000),
                    title: `Mock Event ${i + 1}`,
                    startDate,
                    endDate,
                    // Optional: add a color from your palette
                    color: ['#F34040', '#555CEE', '#8CE25E', '#CF40F3', '#F37040'][Math.floor(Math.random() * 5)]
                });
            }
            events.value = mockData;
        };

        const handleRangeUpdate = (range: { start: Date; end: Date }) => {
            currentRange.value = range;
            // Generate new events whenever range changes
            generateMockEvents();
            console.log(events.value)
        };

        const handleModeUpdate = (mode: 'daily' | 'weekly' | 'monthly') => {
            currentMode.value = mode;
            // Mode update usually follows a range update, but we call it here to be safe
            generateMockEvents();
        };

        const refreshCalendar = () => {
            calendarStore.refreshData();
            generateMockEvents();
        };

        const openSharePopup = () => {
            sharePopup.value?.open()
        }

        useSeoMeta({
            title: () => t('seo.dashboard.calendar.title'),
            description: () => t('seo.dashboard.calendar.description'),
            ogTitle: () => `${t('seo.siteName')} - ${t('seo.dashboard.calendar.title')}`,
        });

        return {
            handleModeUpdate,
            handleRangeUpdate,
            currentMode,
            openSharePopup,
            refreshCalendar,
            sharePopup,
            t,
            eventPopup,
            openEventDetails,
            currentRange,
        }
    }
})

</script>