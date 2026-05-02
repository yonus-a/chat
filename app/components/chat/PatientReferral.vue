<template>
    <BPopup has-close :title="t('chat.patientReferral.priority.title')" ref="popup">
        <div class="w-86"></div>
    </BPopup>
</template>
<script lang="ts">
import { defineComponent, watch, type PropType } from 'vue';
import type { Popup } from '~/types/components/popup';
import { useServiceStore, useI18n, useAppToast } from '#imports';
import type { Contact } from '~/types/chat';
export interface PatientRefferalExposed {
    open: () => void;
    close: () => void;
}

export default defineComponent({
    name: 'PatientReferral',
    props: {
        contact: {
            type: Object as PropType<Contact>,
            required: true,
        }
    },
    setup(props, { expose }) {
        const serviceStore = useServiceStore()
        const { openToast } = useAppToast()
        const { t } = useI18n()

        const field = ref({
            value: [],
            message: '',
            color: 'primary'
        })

        const priority = ref({ value: [], color: 'primary', message: '' })

        const referStates = computed(() => [
            {
                label: t('chat.patientReferral.priority.high'),
                value: 'high'
            },
            {
                label: t('chat.patientReferral.priority.medium'),
                value: 'medium'
            },
            {
                label: t('chat.patientReferral.priority.low'),
                value: 'low'
            },
        ])

        const description = ref({
            value: '', color: 'primary', message: ''
        })

        const popup = ref<Popup | null>(null)
        const isLoading = computed(() => serviceStore.isLoadingServices)
        const isSending = ref(false)
        const hasErrors = ref(false)
        const serviceOptions = computed(() =>
            serviceStore.services.map(service => ({
                label: service.label,
                value: service.id,
            }))
        );


        const validateFields = () => {
            if (hasErrors.value || isSending.value) return


            if (!hasErrors.value) {
                submitReferral()
            }
        }

        const submitReferral = async () => {
            if (isSending.value || hasErrors.value) return
            try {
                isSending.value = true;
            } catch (error) {


            } finally {
                isSending.value = false;
            }
        }

        const open = () => {
            popup.value?.open()
        }

        const close = () => {
            popup.value?.close()
        }

        expose({ close, open } as PatientRefferalExposed);

        return {
            popup,
            t,
            referStates,
        }
    }
})
</script>