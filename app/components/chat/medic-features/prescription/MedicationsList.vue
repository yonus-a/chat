<template>
    <div class="w-full h-full min-h-full flex flex-col gap-y-4">
        <div :class="[mode === 'responsive' ? 'max-h-32 lg:min-h-full transition-all duration-300 ease-in-out' : 'h-full flex-1']"
            class="w-full overflow-y-auto  md:overflow-hidden rounded-xl bg-surface-variant select-none px-3 pt-3 flex flex-col gap-y-3">
            <div :class="[mode === 'full' ? 'block' : 'lg:block hidden']"
                class="shrink-0 text-body-sm text-on-surface/50">
                {{ t('chat.prescription.medicine') }}
            </div>
            <div class="w-full flex flex-col flex-1 gap-y-1 lg:gap-y-2 pb-3 overflow-y-auto hide-scrollbar">
                <MedicineDisplay @delete="deleteMedicine(index)" v-for="(medicine, index) in medications"
                    :key="medicine.id" :medicine="medicine" :mode="mode" />
            </div>
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
    components: { MedicineDisplay },
    props: {
        medications: { type: Array as PropType<PrescribedMedication[]>, default: () => [] },
        mode: { type: String as PropType<'responsive' | 'full'>, default: 'responsive' }
    },
    emits: ['delete'],
    setup(_, { emit }) {
        const { t } = useI18n();

        const deleteMedicine = (index: number) => {
            emit('delete', index)
        }

        return { t, deleteMedicine };
    }
});
</script>