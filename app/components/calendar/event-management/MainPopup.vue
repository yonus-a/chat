<template>
    <BPopup no-padding ref="popup" @closed="onClosed">
        <div class=" w-dvw flex justify-center max-w-dvw md:max-w-98">
            <div class=" w-full flex justify-center">
                <div class=" w-full px-6 py-4 max-w-99">
                    <div class=" mb-4 flex items-center gap-x-3 select-none text-on-surface ">
                        <BIcon class=" opacity-50 cursor-pointer w-5 h-5" @click="close" icon="PhX" />
                        <div class=" text-label-sm">{{ popupTitle }}</div>
                    </div>
                    <CreateEvent v-show="mode === 'create' && step === 1" :key="`step1-${sessionKey}`"
                        :initial-data="eventData" @close="close" @submit="handleStep1Submit" />

                    <EventTiming :sending="isSending" v-show="mode === 'timing'" :key="`step2-${sessionKey}`"
                        :initial-data="timingData" @back="handleTimingBack" @submit="handleTimingSubmit" />

                    <EventRepetition :sending="isSending" v-show="mode === 'repetition'" :key="`step3-${sessionKey}`"
                        :initial-data="repetitionData" @back="handleRepetitionBack" @submit="handleRepetitionSubmit" />

                    <div v-if="mode === 'create' && step === 2" class="w-full max-w-99 px-6 py-4 bg-surface rounded-xl">
                        <div class="text-label-md mb-4">{{ t('calendar.form.step2Title') || 'Step 2 Details' }}</div>

                        <div class="text-body-sm text-on-surface/70 mb-6">
                            Event Type Selected: <strong>{{ eventData?.eventType }}</strong>
                        </div>
                        <div class="flex gap-x-3">
                            <BButton type="outline" text="Back" @click="step = 1" class="flex-1" />
                            <BButton color="primary" text="Final Submit" @click="finalSubmit" class="flex-1" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </BPopup>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import type { Popup } from '~/types/components/popup';
import CreateEvent from './CreateEvent.vue';
import { useI18n, useAppToast } from '#imports';
import EventTiming from './EventTiming.vue';
import EventRepetition from './EventRepetition.vue';
import { useEventBus } from '@vueuse/core';
import type { CalendarEventPayload } from '~/types/calendar';

type EventPopupModes = 'create' | '' | 'timing' | 'repetition';

export default defineComponent({
    name: 'EventPopup',
    components: { CreateEvent, EventTiming, EventRepetition },
    emits: ['submit', 'edit'],
    setup(_, { expose, emit }) {
        const { t } = useI18n();
        const { openToast } = useAppToast()
        const popup = ref<Popup | null>(null);
        const isEditting = ref(false)
        const currentEditId = ref<number | null>(null);
        const mode = ref<EventPopupModes>('create');
        const popupTitle = computed(() => isEditting.value ? t('calendar.form.editEvent') : t('calendar.form.addEvent'))
        const isSending = ref(false)


        const bus = useEventBus<any>('calendar-actions');
        bus.on((payload) => {
            if (payload.type === 'edit-event' && payload.event) {
                open(payload.event);
            }
        });

        // Multi-step form state
        const step = ref(1);
        const eventData = ref<Record<string, any> | null>(null);
        const timingData = ref<Record<string, any> | null>(null);
        const sessionKey = ref(0);

        const submittedEventData = ref<Record<string, any> | null>(null);
        const submittedTimingData = ref<Record<string, any> | null>(null);

        const isTransitioning = ref(false);

        // 2. Add a helper function to safely transition without wiping data
        const transitionToStep = (newStep: number, newMode: EventPopupModes) => {
            isTransitioning.value = true;
            popup.value?.close();
            setTimeout(() => {
                step.value = newStep;
                mode.value = newMode;
                popup.value?.open();
                // Release the lock after animation finishes
                setTimeout(() => { isTransitioning.value = false; }, 300);
            }, 300);
        };

        const handleTimingBack = () => transitionToStep(1, 'create');
        const handleRepetitionBack = () => transitionToStep(2, 'timing');

        const handleStep1Submit = (payload: Record<string, any>) => {
            submittedEventData.value = payload; // Safe assignment
            transitionToStep(2, 'timing');
        };

        const handleTimingSubmit = (payload: Record<string, any>) => {
            submittedTimingData.value = payload; // Safe assignment
            if (payload.hasRepetition) {
                const normalizedDate = new Date(payload.date);
                normalizedDate.setHours(0, 0, 0, 0);
                repetitionData.value = {
                    ...(repetitionData.value || {}),
                    hasRepetition: true,
                    wholeDay: payload.isFullDay,
                    repetitionStart: normalizedDate
                };
                transitionToStep(3, 'repetition');
            } else {
                finalSubmit();
            }
        };



        const open = (event?: CalendarEventPayload) => {
            // THE SLEDGEHAMMER: Bump the key to nuke old component instances and spawn fresh ones
            sessionKey.value++;

            if (event && event.id) {
                isEditting.value = true;
                currentEditId.value = event.id;

                // Pre-fill Step 1
                eventData.value = {
                    isEditing: true,
                    eventType: event.eventType || 'task',
                    title: event.title || '',
                    description: event.description || '',
                    selectedUsers: event.accesss?.map(a => a.user.id) || [],
                    attachement: event.attachement || '',
                    color: event.color || '',
                    checkList: event.checkList ? JSON.parse(JSON.stringify(event.checkList)) : []
                };

                // Format Date safely
                const d = new Date(event.date);
                const pad = (n: number) => n.toString().padStart(2, '0');
                const dateVal = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

                // Pre-fill Step 2
                timingData.value = {
                    isEditing: true,
                    date: dateVal,
                    time: event.time || '',
                    isFullDay: event.isFullDay || false,
                    hasRepetition: event.hasRepetition || false
                };

                // Pre-fill Step 3
                if (event.hasRepetition && event.repetition) {
                    repetitionData.value = {
                        mode: 'edit',
                        ...event.repetition
                    };
                } else {
                    repetitionData.value = null;
                }
            } else {
                // EXPLICITLY RESET EVERYTHING FOR A NEW EVENT
                isEditting.value = false;
                currentEditId.value = null;
                eventData.value = null;
                timingData.value = null;
                repetitionData.value = null;
            }
            popup.value?.open();
        };

        const close = () => popup.value?.close();

        // Wipe data completely when popup is dismissed to prevent leaking state to the next open


        expose({ open, close });

        const repetitionData = ref<Record<string, any> | null>(null);





        const handleRepetitionSubmit = (payload: Record<string, any>) => {
            repetitionData.value = payload;
            finalSubmit();
        };
        const finalSubmit = async () => {
            if (isSending.value) return; // Prevent double submission

            const finalPayload: Record<string, any> = {
                ...(submittedEventData.value || eventData.value),
                ...(submittedTimingData.value || timingData.value),
            };

            if ((submittedTimingData.value?.hasRepetition || timingData.value?.hasRepetition) && repetitionData.value) {
                const { hasRepetition, mode: repMode, ...pureRepetitionData } = repetitionData.value;
                finalPayload.repetition = pureRepetitionData;
            }
            delete finalPayload.isEditing;
            isSending.value = true;
            try {
                await new Promise(resolve => setTimeout(resolve, 1500));

                if (isEditting.value && currentEditId.value) {
                    finalPayload.id = currentEditId.value;
                    emit('edit', finalPayload);
                    openToast(t('calendar.api.edittedSuccess', { title: t(`calendar.form.type.${finalPayload.eventType}`) }), 'success')

                    console.log('Event Edited Successfully');
                } else {
                    emit('submit', finalPayload);
                    openToast(t('calendar.api.createdSuccess', { title: t(`calendar.form.type.${finalPayload.eventType}`) }), 'success')
                    console.log('Event Created Successfully');
                }
                close();
            } catch (error) {
                openToast(t('calendar.api.error', { title: t(`calendar.form.type.${finalPayload.eventType}`) }), 'error')
                console.error("Submission failed", error);
            } finally {
                isSending.value = false;
            }
        };

        const onClosed = () => {
            if (isTransitioning.value) return;
            mode.value = 'create';
            step.value = 1;

            eventData.value = null;
            timingData.value = null;
            repetitionData.value = null;
            submittedEventData.value = null;
            submittedTimingData.value = null;
            isEditting.value = false;
            currentEditId.value = null;
            console.log('fuck')

        };

        return {
            t,
            popup,
            mode,
            step,
            handleTimingSubmit,
            isSending,
            eventData,
            timingData,
            handleTimingBack,
            handleStep1Submit,
            popupTitle,
            handleRepetitionSubmit,
            finalSubmit,
            onClosed,
            close,
            repetitionData,
            handleRepetitionBack,
            sessionKey,
        };
    }
});
</script>