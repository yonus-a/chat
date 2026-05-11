<template>
    <div class=" w-full">
        <div class=" flex w-full items-center gap-x-3">
            <BInput :title="t('calendar.form.date')" type="date" v-model="chosenDate.value" :color="chosenDate.color"
                :placeholder="t('general.select')" />
            <BInput :title="t('calendar.form.hour')" preset="time" v-model="chosenTime.value"
                :color="chosenTime.color" />
        </div>
        <div class=" -translate-y-4 pb-2 h-0 overflow-visible w-full">
            <ErrorDisplay :error="timeError" />
        </div>
        <div class=" flex flex-col  gap-y-4.5">
            <BCheckBox mode="switch" v-model="isFullDay" :label="t('calendar.form.wholeDay')" />
            <BCheckBox v-model="hasRepetition" :label="t('calendar.form.repeat')" />
        </div>

        <div class=" w-full pt-4 flex items-center gap-x-3">
            <div class=" basis-1/2">
                <BButton :disabled="hasErrors" @click="validateFields" :text="t('calendar.form.continue')"
                    class=" w-full min-w-full" />
            </div>
            <div class=" basis-1/2">
                <BButton @click="goBack" color="secondary" :text="t('calendar.form.back')" class=" w-full min-w-full" />
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, watch, onMounted, ref } from 'vue';
import { useI18n } from '#imports';
import ErrorDisplay from '~/components/general/ErrorDisplay.vue';
import { errorMessages } from 'vue/compiler-sfc';
export default defineComponent({
    name: 'EventTiming',
    props: {
        initialData: {
            type: Object as PropType<Record<string, any> | null>,
            default: null
        }
    },
    emits: ['back', 'submit'],
    components: { ErrorDisplay, },
    setup(props, { emit }) {
        const { t } = useI18n()
        const hasErrors = ref(false)
        const chosenTime = ref({ value: '', color: 'primary', message: '' })
        const chosenDate = ref({ value: '', color: 'primary', message: '' })
        const timeError = ref('')
        const hasRepetition = ref(false)
        const isFullDay = ref(false)


        onMounted(() => {
            if (props.initialData) {
                chosenDate.value.value = props.initialData.date || '';
                chosenTime.value.value = props.initialData.time || '';
                isFullDay.value = props.initialData.isFullDay || false;
                hasRepetition.value = props.initialData.hasRepetition || false;
            }
        });

        const clearField = (fieldRef: any) => {
            if (fieldRef.value.color === 'error') {
                fieldRef.value.color = 'primary';
                fieldRef.value.message = '';
            }
            timeError.value = '';
            hasErrors.value = false;
        };

        watch(() => chosenDate.value.value, () => { clearField(chosenDate) })
        watch(() => chosenTime.value.value, () => { clearField(chosenTime) })

        const validateFields = () => {
            const dateStr = chosenDate.value.value;
            const timeStr = chosenTime.value.value || '00:00';

            if (!dateStr) {
                chosenDate.value.color = 'error';
                chosenTime.value.color = 'error'
                timeError.value = t('validation.required', { field: t('calendar.form.fullDate') })
                return;

            }

            const selectedDateTime = new Date(`${dateStr}T${timeStr}`);
            const now = new Date();

            if (selectedDateTime < now) {
                timeError.value = t('calendar.form.timeErrors.past');
                chosenDate.value.color = 'error';
                chosenTime.value.color = 'error';
                hasErrors.value = true;
                return;
            }

            submitFields();
        };

        const submitFields = () => {
            emit('submit', {
                date: chosenDate.value.value,
                time: chosenTime.value.value,
                isFullDay: isFullDay.value,
                hasRepetition: hasRepetition.value
            });
        };

        const goBack = () => {
            emit('back')
        }



        return {
            t,
            isFullDay,
            validateFields,
            timeError,
            goBack,
            hasRepetition,
            chosenDate,
            hasErrors,
            chosenTime,
        }
    }
})
</script>