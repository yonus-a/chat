<template>
    <BPopup no-padding ref="popup" @closed="onClosed">
        <div class=" w-dvw flex justify-center max-w-dvw md:max-w-98">
            <div class=" w-full flex justify-center">
                <div class=" w-full px-6 py-4 max-w-99">
                    <div class=" mb-4 flex items-center gap-x-3 select-none text-on-surface ">
                        <BIcon class=" opacity-50 cursor-pointer w-5 h-5" @click="close" icon="PhX" />
                        <div class=" text-label-sm">{{ popupTitle }}</div>
                    </div>
                    <CreateEvent v-if="mode === 'create' && step === 1" :initial-data="eventData" @close="close"
                        @submit="handleStep1Submit" />
                    <EventTiming v-if="mode === 'timing'" :initial-data="timingData" @back="handleTimingBack"
                        @submit="handleTimingSubmit" />
                    <EventRepetition v-if="mode === 'repetition'" :initial-data="repetitionData"
                        @back="handleRepetitionBack" @submit="handleRepetitionSubmit" />

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
import { useI18n } from '#imports';
import EventTiming from './EventTiming.vue';
import EventRepetition from './EventRepetition.vue';

type EventPopupModes = 'create' | '' | 'timing' | 'repetition';

export default defineComponent({
    name: 'EventPopup',
    components: { CreateEvent, EventTiming, EventRepetition },
    setup(_, { expose }) {
        const { t } = useI18n();
        const popup = ref<Popup | null>(null);
        const isEditting = ref(false)
        const mode = ref<EventPopupModes>('create');
        const popupTitle = computed(() => isEditting.value ? t('calendar.form.editEvent') : t('calendar.form.addEvent'))

        // Multi-step form state
        const step = ref(1);
        const eventData = ref<Record<string, any> | null>(null);

        const timingData = ref<Record<string, any> | null>(null);

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
            eventData.value = payload;
            transitionToStep(2, 'timing');
        };

        const handleTimingSubmit = (payload: Record<string, any>) => {
            timingData.value = payload;
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



        const open = () => popup.value?.open();
        const close = () => popup.value?.close();

        // Wipe data completely when popup is dismissed to prevent leaking state to the next open


        expose({ open, close });

        const repetitionData = ref<Record<string, any> | null>(null);





        const handleRepetitionSubmit = (payload: Record<string, any>) => {
            repetitionData.value = payload;
            finalSubmit();
        };

        const finalSubmit = () => {
            const finalPayload = {
                ...eventData.value,
                ...timingData.value,
            };

            if (timingData.value?.hasRepetition && repetitionData.value) {
                const { hasRepetition, ...pureRepetitionData } = repetitionData.value;
                finalPayload.repetition = pureRepetitionData;
            }

            console.log("FINAL API PAYLOAD:", finalPayload);
            close();
        };

        // 5. Update onClosed to clear the new state:
        const onClosed = () => {
            if (isTransitioning.value) return;
            mode.value = 'create';
            step.value = 1;
            eventData.value = null;
            timingData.value = null;
            repetitionData.value = null;
        };

        return {
            t,
            popup,
            mode,
            step,
            handleTimingSubmit,
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
        };
    }
});
</script>