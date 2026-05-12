<template>
    <div class=" w-full h-full max-h-full flex flex-col">
        <CalendarHeader ref="header" @add="openEventDetails" @refresh="refreshCalendar" @share="openSharePopup"
            @update:mode="handleModeUpdate" @update:range="handleRangeUpdate" />
        <div class=" w-full overflow-hidden flex-1 ">
            <CalendarGrid :loading="isLoading" @update:mode="applyModeUpdate" @update:range="handleRangeUpdate"
                :events="events" :range="currentRange" :mode="currentMode" :hours="calculatedHoursRange" />
        </div>
        <SharePopup ref="sharePopup" />
        <MainPopup ref="eventPopup" />
    </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useI18n, useSeoMeta, useCalendarStore } from '#imports';
import CalendarHeader, { type CalendarHeaderExposed } from '~/components/calendar/CalendarHeader.vue';
import CalendarGrid from '~/components/calendar/grid/CalendarGrid.vue';
import SharePopup from '~/components/calendar/SharePopup.vue';
import type { Popup } from '~/types/components/popup';
import type { CalendarEvent } from '~/types/components/calendar';
import type { CalendarEventPayload, EventCategory, RepetitionCycleType } from '~/types/calendar';
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
        const calendarHeader = useTemplateRef<CalendarHeaderExposed>('header')
        const isLoading = ref(false)

        const eventPopup = ref<Popup | null>(null)
        const sharePopup = ref<Popup | null>(null)

        const events = ref<CalendarEventPayload[]>([]);


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

            // Mock constants for Service generation
            const mockFellowships: Fellowship[] = [
                { id: 101, title: "فلوشیپ اینترونشنال کاردیولوژی" },
                { id: 102, title: "فلوشیپ اکوکاردیوگرافی" },
                { id: 103, title: "فلوشیپ جراحی زانو" },
                { id: 104, title: "فلوشیپ سم‌شناسی" },
            ];

            const mockClinics: Clinic[] = [
                { id: 501, title: 120, latitude: 35.7219, longitude: 51.3347 },
                { id: 502, title: 130, latitude: 35.7, longitude: 51.4 },
            ];

            const baseServices: Service[] = [
                { id: 1, label: "پزشک قلب", expertiseLevel: "speciality", fellowships: [mockFellowships!, mockFellowships!], price: 100000 },
                { id: 2, label: "پزشک متخصص ریه", expertiseLevel: "speciality", fellowships: [], price: 200000 },
                { id: 3, label: "متخصص ارتوپدی", expertiseLevel: "sub-speciality", fellowships: [mockFellowships!], price: 300000 },
                { id: 4, label: "متخصص مغز و اعصاب", expertiseLevel: "speciality", fellowships: [], price: 100000 },
                { id: 5, label: "متخصص گوش، حلق و بینی", expertiseLevel: "speciality", fellowships: [], price: 200000 },
                { id: 6, label: "چشم پزشک", expertiseLevel: "speciality", fellowships: [mockFellowships!], price: 400000 },
            ];

            const statuses: ServiceRequest["status"][] = ["searching", "pending", "approved", "payment", "rejected", "expired"];

            // Adjust count based on mode
            const eventCount = currentMode.value === "daily" ? 6 : currentMode.value === "weekly" ? 15 : 45;
            const categories: EventCategory[] = ["task", "medicine", "event", "service"];
            const colors = ["#F34040", "#F37040", "#E9EF37", "#8CE25E", "#40F3E4", "#555CEE", "#CF40F3", "#F897F6", "#2C2727"];

            let lastUsedTimestamp: number | null = null;

            for (let i = 0; i < eventCount; i++) {
                let randomStartTimestamp: number;

                if (currentMode.value === "monthly" && lastUsedTimestamp && Math.random() < 0.3) {
                    randomStartTimestamp = lastUsedTimestamp + Math.random() * 2 * 60 * 60 * 1000;
                } else {
                    randomStartTimestamp = startTime + Math.random() * (endTime - startTime);
                }
                lastUsedTimestamp = randomStartTimestamp;

                const startDate = new Date(randomStartTimestamp);
                const type = categories[Math.floor(Math.random() * categories.length)];

                const isFullDay = Math.random() < 0.2;
                const hasRepetition = Math.random() < 0.15;

                const event: CalendarEventPayload = {
                    id: Math.floor(100000 + Math.random() * 900000),
                    eventType: type,
                    title: type === "service" ? "درخواست خدمت" : `Random ${type.charAt(0).toUpperCase() + type.slice(1)} ${i + 1}`,
                    description: `This is a randomized description for a ${type} entry.`,
                    color: type === "service" ? "#555CEE" : colors[Math.floor(Math.random() * colors.length)],
                    date: startDate,
                    time: startDate.toTimeString().slice(0, 5),
                    isFullDay,
                    hasRepetition,
                    selectedUsers: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => (Math.random() > 0.5 ? 1 : 2)),
                    attachement: Math.random() < 0.3 ? "https://pdf.ir/document.pdf" : undefined,
                };

                // --- SERVICE SPECIFIC MOCK DATA ---
                if (type === "service") {
                    const baseService = baseServices[Math.floor(Math.random() * baseServices.length)]!;
                    event.title = baseService.label;

                    event.service = {
                        ...baseService,
                        status: statuses[Math.floor(Math.random() * statuses.length)],
                        provider: [
                            {
                                id: 2,
                                name: "سارا",
                                lastName: "احمدی",
                                isOnline: Math.random() > 0.5,
                                lastSeen: new Date(startDate.getTime() - 3600000),
                                imageUrl: "https://i.pravatar.cc/150?u=2",
                                isActive: true,
                                unreadCount: 0,
                                serviceType: "voice-call",
                                birthDate: new Date(1995, 5, 15),
                                phoneNumber: "09134168227",
                                nationalCode: "1235678901",
                                userType: ["user"],
                                expertise: "متخصص داخلی",
                                clinics: mockClinics,
                                fellowships: [mockFellowships[Math.floor(Math.random() * mockFellowships.length)]!],
                                type: "private",
                                status: "approved",
                                service: baseService,
                            },
                        ],
                    };
                }

                // --- TASK CHECKLIST ---
                if (type === "task") {
                    event.checkList = [
                        { text: "بررسی مستندات", isChecked: Math.random() > 0.5 },
                        { text: "تایید نهایی", isChecked: Math.random() > 0.5 },
                    ];
                }

                // --- REPETITION CONFIG ---
                if (hasRepetition && type !== "service") {
                    const repType: RepetitionCycleType = ["day", "hour", "custom"][Math.floor(Math.random() * 3)] as RepetitionCycleType;
                    event.repetition = {
                        repetitionStart: startDate,
                        repetitionType: repType,
                        repeatTimeCycle: Math.floor(Math.random() * 5) + 1,
                        selectedDays: repType === "custom" ? Array.from({ length: 7 }, (_, i) => i).sort(() => 0.5 - Math.random()).slice(0, 3) : undefined,
                        wholeDay: isFullDay,
                        chosenTime: event.time,
                        isReminder: Math.random() > 0.5,
                        selectedReminder: 15,
                        repeatitionEnd: Math.random() > 0.5 ? "date" : "times",
                        repetitionAmount: Math.random() > 0.5 ? 5 : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    };
                }

                mockData.push(event);
            }

            events.value = mockData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        };

        const handleRangeUpdate = (range: { start: Date; end: Date }) => {
            const isInsideOldRange = currentRange.value &&
                range.start.getTime() >= currentRange.value.start.getTime() &&
                range.end.getTime() <= currentRange.value.end.getTime();

            currentRange.value = range;

            if (!isInsideOldRange) {
                generateMockEvents();
                console.log('Generated new data for range');
            } else {
                console.log('Range inside existing data, skipped generation');
            }
        };

        const handleModeUpdate = (mode: 'daily' | 'weekly' | 'monthly') => {
            currentMode.value = mode;
        };

        const applyModeUpdate = (mode: 'daily' | 'weekly' | 'monthly', targetDate?: Date) => {
            calendarHeader.value?.setTab(mode, targetDate);
        }

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


        const calculatedHoursRange = computed(() => {
            if (!events.value || events.value.length === 0) {
                return { start: 0, end: 24 };
            }

            let minHour = 24;
            let maxHour = 0;

            events.value.forEach(event => {
                if (!event.time) return;

                const hour = parseInt(event.time.split(':'), 10);

                if (isNaN(hour)) return;

                if (hour < minHour) minHour = hour;
                if (hour > maxHour) maxHour = hour;
            });

            if (minHour === 24) {
                return { start: 0, end: 24 };
            }

            return {
                start: Math.max(0, minHour - 1),
                end: Math.min(24, maxHour + 2)
            };
        });

        return {
            applyModeUpdate,
            handleModeUpdate,
            handleRangeUpdate,
            currentMode,
            events,
            openSharePopup,
            refreshCalendar,
            sharePopup,
            calculatedHoursRange,
            calendarHeader,
            t,
            eventPopup,
            openEventDetails,
            currentRange,
            isLoading,
        }
    }
})

</script>