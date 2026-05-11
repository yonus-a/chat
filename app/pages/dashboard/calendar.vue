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

            const mockData: CalendarEventPayload[] = [];
            const startTime = currentRange.value.start.getTime();
            const endTime = currentRange.value.end.getTime();

            // Adjust count based on mode
            const eventCount = currentMode.value === 'daily' ? 6 : currentMode.value === 'weekly' ? 15 : 45;

            const categories: EventCategory[] = ['task', 'medicine', 'event'];
            const colors = ['#F34040', '#F37040', '#E9EF37', '#8CE25E', '#40F3E4', '#555CEE', '#CF40F3', '#F897F6', '#2C2727'];

            let lastUsedTimestamp: number | null = null;

            for (let i = 0; i < eventCount; i++) {
                // --- RANDOM DATE LOGIC ---
                let randomStartTimestamp: number;

                // In monthly mode, 30% chance to use the same day as the previous event to test clustering
                if (currentMode.value === 'monthly' && lastUsedTimestamp && Math.random() < 0.3) {
                    randomStartTimestamp = lastUsedTimestamp + (Math.random() * 2 * 60 * 60 * 1000); // Shift by a few hours
                } else {
                    randomStartTimestamp = startTime + Math.random() * (endTime - startTime);
                }
                lastUsedTimestamp = randomStartTimestamp;

                const startDate = new Date(randomStartTimestamp);
                const type = categories[Math.floor(Math.random() * categories.length)];

                // Timing logic
                const isFullDay = Math.random() < 0.2; // 20% chance of full day
                const hasRepetition = Math.random() < 0.15; // 15% chance of repetition
                const durationHours = (Math.floor(Math.random() * 4) + 1); // 1-4 hours

                // --- CONSTRUCT PAYLOAD ---
                const event: CalendarEventPayload = {
                    id: Math.floor(100000 + Math.random() * 900000), // Unique 6-digit ID
                    eventType: type,
                    title: `Random ${type.charAt(0).toUpperCase() + type.slice(1)} ${i + 1}`,
                    description: `This is a fully randomized description for event #${i + 1}. Truly chaotic metadata here.`,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    date: startDate,
                    time: startDate.toTimeString().slice(0, 5), // "HH:mm"
                    isFullDay,
                    hasRepetition,
                    selectedUsers: [Math.floor(Math.random() * 100), Math.floor(Math.random() * 100)],
                    attachement: Math.random() < 0.3 ? 'document.pdf' : undefined
                };

                // Add Checklist only for tasks
                if (type === 'task') {
                    event.checkList = [
                        { text: 'Verify chaotic logic', isChecked: Math.random() > 0.5 },
                        { text: 'Randomize the randomization', isChecked: Math.random() > 0.5 }
                    ];
                }

                // Add Repetition Logic if enabled
                if (hasRepetition) {
                    const repType: RepetitionCycleType = ['day', 'hour', 'custom'][Math.floor(Math.random() * 3)] as RepetitionCycleType;
                    event.repetition = {
                        repetitionStart: startDate,
                        repetitionType: repType,
                        repeatTimeCycle: Math.floor(Math.random() * 5) + 1,
                        selectedDays: repType === 'custom' ? : undefined,
                        wholeDay: isFullDay,
                        chosenTime: event.time,
                        isReminder: Math.random() > 0.5,
                        selectedReminder: 15,
                        repeatitionEnd: Math.random() > 0.5 ? 'date' : 'times',
                        repetitionAmount: Math.random() > 0.5 ? 5 : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
                    };
                }

                mockData.push(event);
            }

            // Sort by date to make it easier for the grid to process
            events.value = mockData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        };

        const handleRangeUpdate = (range: { start: Date; end: Date }) => {
            currentRange.value = range;
            // Generate new events whenever range changes
            generateMockEvents();
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