<template>
    <div :class="[mode === 'full' ? 'block' : 'lg:block hidden']"
        class="w-full bg-surface border select-none border-outline-variant rounded-xl p-3">
        <div class="flex justify-between w-full items-center text-on-surface">
            <div class=" flex items-center gap-x-3">
                <BIcon icon="PhTrash" class=" cursor-pointer fill-on-surface/50 w-5 h-5" @click="deleteMedicine" />
                <div class="text-label-md" :class="[medicine.warning ? 'text-error' : '']">{{ medicine.medication.title
                    }}
                </div>
            </div>
            <div class="text-body-md opacity-50" v-if="locale !== 'en'">{{ medicine.medication.englishTitle }}</div>
        </div>
        <div class="w-full flex justify-between mt-2 items-center">
            <div class="text-on-surface flex gap-x-2 items-center">
                <div class="opacity-50 text-body-md">{{ t('chat.prescription.dose') }}:</div>
                <div class="text-label-md">{{ medicine.dose }}</div>
            </div>
            <div class="text-on-surface flex gap-x-2 items-center">
                <div class="opacity-50 text-body-md">{{ t('chat.prescription.repeat') }}:</div>
                <div class="text-label-md">{{ t('chat.prescription.usage', {
                    time: t(`calendar.form.repetition.${medicine.period.period}`),
                    count: medicine.repetitionAmount
                }) }}</div>
            </div>
        </div>
        <div class="w-full mt-2 flex justify-between items-center">
            <div class="text-on-surface flex gap-x-2 items-center">
                <div class="opacity-50 text-body-md">{{ t('chat.prescription.usageMethod') }}:</div>
                <div class="text-label-md">{{ medicine.usageMethod }}</div>
            </div>
        </div>
        <div class="w-full text-on-surface gap-x-3 mt-2 flex justify-start items-start" v-if="medicine.warning">
            <BIcon weight="fill" icon="PhWarningOctagon" class="w-5 shrink-0 h-5 fill-error" />
            <div class="opacity-50 shrink-0 text-body-sm">{{ t('chat.prescription.warning') }}:</div>
            <div class="flex-1 text-label-sm">{{ medicine.warning }}</div>
        </div>
    </div>

    <div :class="[mode === 'full' ? 'hidden' : 'lg:hidden flex']"
        class="text-body-md select-none flex-wrap items-center text-on-surface/50 gap-x-1">
        <div v-if="medicine.warning" class="flex items-center gap-x-1">
            <BIcon weight="fill" icon="PhWarningOctagon" class="w-5 shrink-0 h-5 fill-error" />
            <div class="text-on-surface">{{ t('chat.prescription.warning') }}</div>
        </div>
        <div class="text-on-surface">{{ medicine.medication.title }}</div>
        <div>|</div>
        <div>{{ medicine.dose }}</div>
        <div v-if="locale !== 'en'">| {{ medicine.medication.englishTitle }}</div>
        <div>|</div>
        <div>
            {{ t('chat.prescription.usage', {
                time: t(`calendar.form.repetition.${medicine.period.period}`),
                count: medicine.repetitionAmount
            }) }}
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { PrescribedMedication } from '~/types/medication';
import { useI18n } from '#imports';

export default defineComponent({
    name: 'MedicineDisplay',
    props: {
        medicine: { type: Object as PropType<PrescribedMedication>, required: true },
        mode: { type: String as PropType<'responsive' | 'full'>, default: 'responsive' }
    },
    emits: ['delete'],
    setup(_, { emit }) {
        const { t, locale } = useI18n();


        const deleteMedicine = () => {
            emit('delete')
        }

        return { locale, t, deleteMedicine };
    }
});
</script>