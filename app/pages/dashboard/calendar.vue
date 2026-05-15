<template>
    <div class=" md:w-full w-dvw md:max-w-full h-full max-h-full overflow-hidden flex flex-col">
        <CalendarHeader ref="header" @add="openEventDetails" @refresh="refreshCalendar" @share="openSharePopup"
            @update:mode="handleModeUpdate" @update:range="handleRangeUpdate" />
        <div class=" w-full overflow-hidden flex-1 ">
            <CalendarGrid :loading="isLoading" @update:mode="applyModeUpdate" @update:range="handleRangeUpdate"
                :events="events" :range="currentRange" :mode="currentMode" :hours="calculatedHoursRange" />
        </div>
        <SharePopup ref="sharePopup" />
        <MainPopup ref="eventPopup" />
        <BModal ref="modal" @action="deleteSelectedEvent" :loading="isDeleting" />
    </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed, useTemplateRef } from 'vue';
import { useI18n, useSeoMeta, useCalendarStore, useAppToast } from '#imports';
import CalendarHeader, { type CalendarHeaderExposed } from '~/components/calendar/CalendarHeader.vue';
import CalendarGrid from '~/components/calendar/grid/CalendarGrid.vue';
import SharePopup from '~/components/calendar/SharePopup.vue';
import type { Popup } from '~/types/components/popup';
import type { Modal } from '~/types/components/modal';
import type { CalendarEventPayload, CalendarBusPayload, EventCategory, RepetitionCycleType } from '~/types/calendar';
import { useEventBus } from '@vueuse/core';
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
        const { openToast } = useAppToast()
        const calendarStore = useCalendarStore()
        const calendarHeader = useTemplateRef<CalendarHeaderExposed>('header')
        const isLoading = ref(false)
        const modal = useTemplateRef<Modal>('modal')

        const isDeleting = ref(false)

        const eventPopup = ref<Popup | null>(null)
        const sharePopup = ref<Popup | null>(null)

        const bus = useEventBus<CalendarBusPayload>('calendar-actions');
        const selectedEventId = ref<number | null>(null);
        bus.on((payload) => {
            if (payload.type === 'delete') {
                selectedEventId.value = payload.id;
                modal.value?.openModal(t('calendar.form.delete.title'), t('calendar.form.delete.description'), 'error', true, t('calendar.form.delete.delete'))
            }


            if (payload.type === 'update-event-access-master') {
                const event = events.value.find(e => e.id === payload.eventId);
                if (event && event.accesss) {
                    const accessRecord = event.accesss.find(a => a.user.id === payload.userId);
                    if (accessRecord) accessRecord.accessType = payload.newAccess;
                }
            }

            if (payload.type === 'remove-event-access-master') {
                const event = events.value.find(e => e.id === payload.eventId);
                if (event && event.accesss) {
                    event.accesss = event.accesss.filter(a => a.user.id !== payload.userId);
                }
            }

            if (payload.type === 'add-event-access-master') {
                const event = events.value.find(e => e.id === payload.eventId);
                if (event) {
                    if (!event.accesss) event.accesss = [];
                    event.accesss.push(payload.record);
                }
            }
        });

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

            const categories: EventCategory[] = ["task", "medicine", "event", "service"];
            const colors = ["red", "green", "black", "gray", "yellow", "white"];
            const eventCount = currentMode.value === "daily" ? 6 : currentMode.value === "weekly" ? 15 : 45;

            // Define mock full contacts for the family (matching IDs used in logic)
            const familyContacts: Contact[] = [
                { id: 1, name: "امیر", lastName: "سفری", imageUrl: "https://i.pravatar.cc/150?u=1", isOnline: true },
                { id: 2, name: "سارا", lastName: "احمدی", imageUrl: "https://i.pravatar.cc/150?u=2", isOnline: false }
            ];

            const mockFellowships = [
                { id: 101, title: "فلوشیپ اینترونشنال کاردیولوژی" },
                { id: 102, title: "فلوشیپ اکوکاردیوگرافی" }
            ];
            const mockClinics = [{ id: 501, title: 120, latitude: 35.7219, longitude: 51.3347 }];
            const baseServices = [{ id: 1, label: "پزشک قلب", expertiseLevel: "speciality", price: 100000 }];

            for (let i = 0; i < eventCount; i++) {
                const randomStartTimestamp = startTime + Math.random() * (endTime - startTime);
                const startDate = new Date(randomStartTimestamp);
                const type = categories[Math.floor(Math.random() * categories.length)];

                const isFullDay = Math.random() < 0.2;
                const shouldHaveRepetition = type !== 'service' && Math.random() < 0.4;

                // Generate the "accesss" array using full contact data
                const numUsers = Math.floor(Math.random() * 2) + 1; // 1 or 2 users
                const accessLevels: ("viewer" | "editor" | "owner")[] = ["viewer", "editor", "owner"];

                const eventAccess: EventAccess[] = familyContacts.slice(0, numUsers).map((contact, idx) => ({
                    id: Math.floor(Math.random() * 1000),
                    user: contact,
                    accessType: idx === 0 ? "owner" : accessLevels[Math.floor(Math.random() * 2)]
                }));

                const event: CalendarEventPayload = {
                    id: Math.floor(100000 + Math.random() * 900000),
                    eventType: type,
                    title: `Random ${type} ${i + 1}`,
                    description: `Random description for this ${type}.`,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    date: startDate,
                    time: startDate.toTimeString().slice(0, 5),
                    isFullDay,
                    attachement: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Test.pdf',
                    hasRepetition: shouldHaveRepetition,
                    // selectedUsers is removed here as it's now handled by accesss
                    accesss: eventAccess,
                };

                if (shouldHaveRepetition) {
                    const repType = (["day", "hour", "custom"] as RepetitionCycleType[])[Math.floor(Math.random() * 3)];
                    const endType = (["date", "times"] as RepetitionEndType[])[Math.floor(Math.random() * 2)];

                    let amount: string | number;
                    if (endType === "date") {
                        const futureDate = new Date(startDate);
                        futureDate.setDate(startDate.getDate() + 7 + Math.floor(Math.random() * 60));
                        amount = futureDate.toISOString().split('T'); // FIXED: Added
                    } else {
                        amount = Math.floor(Math.random() * 15) + 2;
                    }

                    let selectedDays: number[] | undefined = undefined;
                    if (repType === "custom") {
                        selectedDays = Array.from({ length: 7 }, (_, i) => i)
                            .sort(() => 0.5 - Math.random())
                            .slice(0, Math.floor(Math.random() * 3) + 1);
                    }

                    const isReminder = Math.random() > 0.5;
                    const reminderValues = [5, 10, 15, 30, 60, 120, 1440];

                    event.repetition = {
                        repetitionStart: startDate,
                        repetitionType: repType,
                        repeatTimeCycle: Math.floor(Math.random() * 4) + 1,
                        selectedDays,
                        wholeDay: isFullDay,
                        chosenTime: event.time,
                        isReminder,
                        // FIXED: Passing a raw value from the allowed options
                        selectedReminder: isReminder ? reminderValues[Math.floor(Math.random() * reminderValues.length)] : undefined,
                        repeatitionEnd: endType,
                        repetitionAmount: amount,
                    };
                }

                if (type === "service") {
                    event.service = {
                        ...baseServices, // FIXED: Spread the specific object
                        status: "pending",
                        provider: [{
                            id: 2,
                            name: "سارا",
                            lastName: "احمدی",
                            isActive: true,
                            imageUrl: "https://i.pravatar.cc/150?u=2",
                            serviceType: "voice-call",
                            clinics: mockClinics,
                            fellowships: mockFellowships
                        }]
                    };
                }

                if (type === "task") {
                    event.checkList = [
                        { text: "Check item 1", isChecked: Math.random() > 0.5 },
                        { text: "Check item 2", isChecked: Math.random() > 0.5 }
                    ];
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

        const deleteSelectedEvent = async () => {
            if (!selectedEventId.value) return;

            isDeleting.value = true;
            try {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                events.value = events.value.filter(e => e.id !== selectedEventId.value);
                openToast(t('calendar.form.delete.success'), 'success');
                modal.value?.closeModal();
                selectedEventId.value = null;
            } catch (error) {
                openToast(t('calendar.form.delete.error'), 'error');
            } finally {
                isDeleting.value = false;
            }
        };

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
            modal,
            deleteSelectedEvent,
            isDeleting,
        }
    }
})

</script>