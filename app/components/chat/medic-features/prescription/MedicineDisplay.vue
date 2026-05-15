<template>
    <div class=" w-full lg:block hidden bg-surface border select-none border-outline-variant rounded-xl p-3">
        <div class=" flex justify-between w-full items-center  text-on-surface">
            <div class=" text-label-md" :class="[medicine.warning ? 'text-error' : '']">{{ medicine.medication.title }}
            </div>
            <div class=" text-body-md opacity-50" v-if="locale !== 'en'">{{ medicine.medication.englishTitle }}</div>
        </div>
        <div class=" w-full flex justify-between items-center">
            <div class=" text-on-surface flex gap-x-2 items-center">
                <div class=" opacity-50 text-body-md">{{ t('chat.prescription.dose') }}:</div>
                <div class=" text-label-md">{{ medicine.dose }}</div>
            </div>
            <div class=" text-on-surface flex gap-x-2 items-center">
                <div class=" opacity-50 text-body-md">{{ t('chat.prescription.repeat') }}:</div>
                <div class=" text-label-md">{{ t('chat.prescription.usage', {
                    time: medicine.period,
                    count: medicine.repetitionAmount
                }) }}</div>
            </div>
        </div>
        <div class=" w-full flex justify-between items-center">
            <div class=" text-on-surface flex gap-x-2 items-center">
                <div class=" opacity-50 text-body-md">{{ t('chat.prescription.usageMethod') }}:</div>
                <div class=" text-label-md">{{ medicine.usageMethod }}</div>
            </div>
        </div>
        <div class=" w-full text-on-surface gap-x-3 flex justify-between" v-if="medicine.warning">
            <BIcon weight="fill" icon="PhWarningOctagon" class="w-6 shrink-0 h-6 fill-error" />
            <div class=" opacity-50 shrink-0 text-body-sm">{{ t('chat.prescription.warning') }}:</div>
            <div class=" flex-1 text-label-sm">{{ medicine.warning }}</div>
        </div>
    </div>
    <div class=" text-body-md select-none items-center text-on-surface/50 flex lg:hidden gap-x-1">
        <div v-if="medicine.warning" class=" flex items-center gap-x-1">
            <BIcon weight="fill" icon="PhWarningOctagon" class="w-6 shrink-0 h-6 fill-error" />
            <div class=" text-on-surface">{{ t('chat.prescription.warning') }}</div>
        </div>
        <div class=" text-on-surface">{{ medicine.medication.title }}</div>
        <div>|</div>
        <div>{{ medicine.dose }}</div>
        <div>|</div>
        <div v-if="locale !== 'en'">{{ medicine.medication.englishTitle }}</div>
        <div>|</div>
        <div>{{ t('chat.prescription.usage', {
            time: medicine.period,
            count: medicine.repetitionAmount
        }) }}</div>
    </div>
</template>
<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { PrescribedMedication } from '~/types/medication';
export default defineComponent({
    name: 'MedicineDisplay',
    props: {
        medicine: {
            type: Object as PropType<PrescribedMedication>,
            required: true,
        }
    },
    setup(props) {
        const { t, locale } = useI18n()


        return {
            locale,
            t,
        }
    }
})
</script>