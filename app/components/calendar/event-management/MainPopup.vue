<template>
    <BPopup no-padding ref="popup" @closed="onClosed">
        <div class=" w-dvw flex justify-center max-w-dvw md:max-w-98">
            <div class=" w-full flex justify-center">
                <div class=" w-full px-6 py-4 max-w-99">
                    <div class=" mb-4 flex items-center gap-x-3 select-none text-on-surface ">
                        <BIcon class=" opacity-50 cursor-pointer w-5 h-5" @click="close" icon="PhX" />
                        <div class=" text-label-sm">{{ t('calendar.form.addEvent') }}</div>
                    </div>
                    <CreateEvent v-if="mode === 'create' && step === 1" :initial-data="eventData" @close="close"
                        @submit="handleStep1Submit" />
                    <EventTiming v-if="mode === 'timing'" :initial-data="timingData" @back="handleTimingBack"
                        @submit="handleTimingSubmit" />
                    <EventRepetition v-if="mode === 'repetition'" />

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
        const mode = ref<EventPopupModes>('repetition');

        // Multi-step form state
        const step = ref(1);
        const eventData = ref<Record<string, any> | null>(null);

        const timingData = ref<Record<string, any> | null>(null);



        const handleTimingBack = () => {
            popup.value?.close()
            setTimeout(() => {
                step.value = 2;
                mode.value = 'create';
                popup.value?.open()
            }, 300);
        };

        const handleStep1Submit = (payload: Record<string, any>) => {
            // Save the data locally and move to the next step
            eventData.value = payload;
            popup.value?.close()
            setTimeout(() => {
                step.value = 2;
                mode.value = 'timing';
                popup.value?.open()
            }, 300);
        };

        const finalSubmit = () => {
            console.log("FINAL API PAYLOAD:", eventData.value);
            // Example: api.post('/events', eventData.value)
            close();
        };

        const handleTimingSubmit = (payload: Record<string, any>) => {
            timingData.value = payload;
            const finalPayload = {
                ...eventData.value,
                ...timingData.value
            };
            console.log("Submitting Final Event:", finalPayload);
            close();
        };

        const open = () => popup.value?.open();
        const close = () => popup.value?.close();

        // Wipe data completely when popup is dismissed to prevent leaking state to the next open
        const onClosed = () => {
            mode.value = 'create';
            eventData.value = null;
            timingData.value = null;
        };

        expose({ open, close });

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
            finalSubmit,
            onClosed,
            close
        };
    }
});
</script>