<template>
    <BPopup no-padding ref="popup" @closed="onClosed">

        <CreateEvent v-if="mode === 'create' && step === 1" :initial-data="eventData" @close="close"
            @submit="handleStep1Submit" />
        <EventTiming v-if="mode === 'timing'" />

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

    </BPopup>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import type { Popup } from '~/types/components/popup';
import CreateEvent from './CreateEvent.vue';
import { useI18n } from '#imports';
import EventTiming from './EventTiming.vue';

type EventPopupModes = 'create' | '' | 'timing';

export default defineComponent({
    name: 'EventPopup',
    components: { CreateEvent, EventTiming },
    setup(_, { expose }) {
        const { t } = useI18n();
        const popup = ref<Popup | null>(null);
        const mode = ref<EventPopupModes>('create');

        // Multi-step form state
        const step = ref(1);
        const eventData = ref<Record<string, any> | null>(null);

        const handleStep1Submit = (payload: Record<string, any>) => {
            // Save the data locally and move to the next step
            eventData.value = payload;
            popup.value?.close()
            setTimeout(() => {
                step.value = 2;
                popup.value?.open()
            }, 300);
        };

        const finalSubmit = () => {
            console.log("FINAL API PAYLOAD:", eventData.value);
            // Example: api.post('/events', eventData.value)
            close();
        };

        const open = () => popup.value?.open();
        const close = () => popup.value?.close();

        // Wipe data completely when popup is dismissed to prevent leaking state to the next open
        const onClosed = () => {
            step.value = 1;
            eventData.value = null;
        };

        expose({ open, close });

        return {
            t,
            popup,
            mode,
            step,
            eventData,
            handleStep1Submit,
            finalSubmit,
            onClosed,
            close
        };
    }
});
</script>