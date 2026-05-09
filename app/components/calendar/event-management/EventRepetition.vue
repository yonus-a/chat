<template>
    <div class=" w-full ">
        <BCheckBox v-model="hasRepetition" :label="t('calendar.form.repeat')" />
        <div class=" w-full mt-3">
            <BInput v-model="repetitionStart.value" :color="repetitionStart.color" :message="repetitionStart.message"
                :title="t('calendar.form.startDate')" type="date" :placeholder="t('general.select')" />
            <BInput @select="selectOption" type="number" :maxlength="2" :options="repetitionTypes"
                v-model="repeatTimeCycle.value" :color="repeatTimeCycle.color" :message="repeatTimeCycle.message"
                :title="t('calendar.form.repeatEvery')" :placeholder="t('general.write')" />
            <div></div>
            <BCheckBox mode="switch" v-model="wholeDay" :label="t('calendar.form.wholeDay')" />
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, watch, ref } from 'vue';
import { useI18n } from '#imports';
import type { MenuOption } from '~/types/components/menu-options';
export default defineComponent({
    name: 'EventRepetition',
    setup() {
        const { t } = useI18n()
        const hasRepetition = ref(false)
        const wholeDay = ref(false)
        const repetitionStart = ref({ value: '', color: 'primary', message: '' })
        const repeatTimeCycle = ref({ value: '', color: 'primary', message: '' })

        const repetitionTypes = computed<MenuOption[]>(() => [
            {
                key: 'day',
                label: t('calendar.form.repetition.day'),
            },
            {
                key: 'hour',
                label: t('calendar.form.repetition.hour'),
            },
            {
                key: 'custom',
                label: t('calendar.form.repetition.custom'),
            },
        ])

        const selectOption = (key: string) => {
            console.log(key)
        }

        return {
            t,
            repetitionStart,
            hasRepetition,
            repetitionTypes,
            repeatTimeCycle,
            wholeDay,
            selectOption,
        }
    }
})
</script>