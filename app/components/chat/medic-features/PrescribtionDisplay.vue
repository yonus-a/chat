<template>
    <BPopup ref="popup" no-padding :has-close="false">
        Hello bitch
    </BPopup>
</template>
<script lang="ts">
import { defineComponent, useTemplateRef, computed, ref } from 'vue';
import { useChatActionStore, useI18n } from '#imports';
import type { Popup } from '~/types/components/popup';

export default defineComponent({
    name: 'PrescriptionDisplay',
    setup() {
        const { t } = useI18n()
        const chatActionStore = useChatActionStore()
        const popup = useTemplateRef<Popup>('popup')

        chatActionStore.prescriptionBus.on((conversationId) => {
            console.log('Prescription triggered for conversation:', conversationId);
            handleOpenPrescription(conversationId);
        });

        const handleOpenPrescription = (id: number) => {
            popup.value?.open()
        };
        const unsubscribe = chatActionStore.prescriptionBus.on((id) => {
        });

        unsubscribe();

        return {
            popup,
        }
    }
})
</script>