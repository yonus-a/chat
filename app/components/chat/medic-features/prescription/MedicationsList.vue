<template>
    <div class="w-full lg:max-w-1/2 lg:w-102 ">
        <div
            class=" w-full h-32 overflow-y-auto md:overflow-hidden lg:h-full rounded-xl bg-surface-variant select-none lg:px-3 lg:pt-3 flex flex-col gap-y-3">
            <div class=" shrink-0 text-body-sm text-on-surface/50 ">{{ t('chat.prescriptions.medicine') }}</div>
            <div class=" w-full flex flex-col flex-1 gap-y-1 lg:gap-y-2 overflow-y-auto">
                <MedicineDisplay v-for="medicine in medications" :key="medicine.id" :medicine="medicine" />
            </div>
        </div>
        <div class=" w-full hidden lg:flex justify-end items-center">
            <BButton :text="t('chat.prescription.submit')" @click="confirmSelections" />
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { PrescribedMedication } from '~/types/medication';
import { useI18n } from '#imports';
import MedicineDisplay from './MedicineDisplay.vue';
export default defineComponent({
    name: 'MedicationsList',
    components: {
        MedicineDisplay,
    },
    props: {
        medications: {
            type: Array as PropType<PrescribedMedication[]>,
            default: () => []
        },
    },
    setup(props) {
        const { t } = useI18n()


        const confirmSelections = () => {

        }

        return {
            t,
            confirmSelections,
        }
    }
})
</script>