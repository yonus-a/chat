<template>
    <div class=" w-full ">
        <BCheckBox v-model="hasRepetition" :label="t('calendar.form.repeat')" />
        <div class=" w-full mt-3">
            <BInput :disabled="!hasRepetition" v-model="repetitionStart.value" :color="repetitionStart.color"
                :message="repetitionStart.message" :title="t('calendar.form.startDate')" type="date"
                :placeholder="t('general.select')" />
            <BInput :disabled="!hasRepetition" :selected-option-key="repetitionType"
                :readonly="repetitionType === 'custom'" @select="selectOption"
                :type="repetitionType === 'custom' ? 'text' : 'number'"
                :maxlength="repetitionType === 'custom' ? undefined : 2" :options="repetitionTypes"
                v-model="repeatTimeCycle.value" :color="repeatTimeCycle.color" :message="repeatTimeCycle.message"
                :title="t('calendar.form.repeatEvery')" :placeholder="t('general.write')" />
            <div class=" w-full flex justify-between items-center transition-all duration-200 ease-in-out overflow-hidden whitespace-nowrap text-wrap"
                :class="[repetitionType === 'custom' ? ' h-auto opacity-100' : ' opacity-0 h-0', !hasRepetition ? ' opacity-50 pointer-events-none' : ' pointer-events-auto']">
                <div @click="addSelection(day.dayOfWeek)" v-for="(day, index) in getWeekDayNames"
                    class=" cursor-pointer w-9 aspect-square  transition-all duration-200 ease-in-out rounded-full flex  items-center justify-center"
                    :class="[isSelected(day.dayOfWeek) ? ' border-outline-variant/0 bg-diamond-black dark:bg-diamond-gray border-0' : ' border border-outline-variant']">
                    <div class="  text-label-md select-none  "
                        :class="[isSelected(day.dayOfWeek) ? ' text-on-primary' : ' text-on-surface/50']"> {{
                            day.label }}</div>
                </div>
            </div>
            <div class=" py-4">
                <BCheckBox :disabled="!hasRepetition" mode="switch" v-model="wholeDay"
                    :label="t('calendar.form.wholeDay')" />
            </div>
            <BInput :disabled="!hasRepetition" :title="t('calendar.form.hour')" v-model="chosenTime.value"
                :color="chosenTime.color" :message="chosenTime.message" preset="time" />
            <div class="pb-4">
                <BCheckBox :disabled="!hasRepetition" mode="switch" v-model="isReminder"
                    :label="t('calendar.form.remind')" />
            </div>
            <div class=" w-full  transition-all duration-200 ease-in-out  whitespace-nowrap text-wrap"
                :class="[isReminder ? ' h-auto opacity-100 overflow-visible' : ' opacity-0 h-0 overflow-hidden']">
                <BSelect :disabled="!hasRepetition" :options="reminderOptions" v-model="selectedReminder.value"
                    :color="selectedReminder.color" :message="selectedReminder.message"
                    :placeholder="t('general.select')" :title="t('calendar.form.remindingTime')" />
            </div>
            <BSelect :disabled="!hasRepetition" :title="t('calendar.form.repeatEnding.title')"
                :placeholder="t('general.select')" :options="repetitionEndTypes" v-model="repeatitionEnd.value"
                :color="repeatitionEnd.color" :message="repeatitionEnd.message" />
            <BInput :disabled="!hasRepetition" :maxlength="endingDetailsProps.type === 'date' ? undefined : 3"
                v-model="repetitionAmount.value" :color="repetitionAmount.color" :message="repetitionAmount.message"
                :title="endingDetailsProps.title" :placeholder="endingDetailsProps.placeholder"
                :type="endingDetailsProps.type" />
            <div class=" flex w-full items-center gap-x-3">
                <div v-for="button in buttonsProps" :key="button.key" class=" basis-1/2">
                    <BButton :disabled="button.disabled" :text="button.text" class=" min-w-full " :color="button.color"
                        :icon="button.icon" @click="handleButtonAction(button.key)" />
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, watch, ref, nextTick, computed, onMounted } from 'vue';
import { useI18n } from '#imports';
import type { MenuOption } from '~/types/components/menu-options';
import { useCalendarDate } from '~/composables/calendar/useCalendarDate';
import type { DropdownOption } from '~/types/components/select';
type RepetitionTypes = 'day' | 'hour' | 'custom'
type RepetitionMode = 'create' | 'edit'
export default defineComponent({
    name: 'EventRepetition',
    emits: ['submit', 'back', 'save-edit'],
    props: {
        initialData: {
            type: Object as PropType<Record<string, any> | null>,
            default: null
        }
    },
    setup(props, { emit }) {
        const { getWeekDayNames } = useCalendarDate()
        const { t } = useI18n()
        const hasRepetition = ref(false)
        const wholeDay = ref(false)
        const repetitionStart = ref({ value: '', color: 'primary', message: '' })
        const repeatTimeCycle = ref({ value: '', color: 'primary', message: '' })
        const chosenTime = ref({ value: '', color: 'primary', message: '' })
        const selectedDays = ref<number[]>([])
        const isReminder = ref(false)
        const repeatitionEnd = ref({ value: 'date', color: 'primary', message: '' })
        const repetitionAmount = ref({ value: 'date', color: 'primary', message: '' })
        const mode = ref<RepetitionMode>('create')
        const initialSnapshot = ref('');
        const hasErrors = ref(false)

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
        const repetitionType = ref<RepetitionTypes>(repetitionTypes.value[0]?.key)

        const getFormData = () => {
            if (!hasRepetition.value) return { hasRepetition: false };
            return {
                hasRepetition: hasRepetition.value,
                repetitionStart: repetitionStart.value.value,
                repeatTimeCycle: repeatTimeCycle.value.value,
                repetitionType: repetitionType.value,
                selectedDays: selectedDays.value,
                wholeDay: wholeDay.value,
                chosenTime: chosenTime.value.value,
                isReminder: isReminder.value,
                selectedReminder: selectedReminder.value.value,
                repeatitionEnd: repeatitionEnd.value.value,
                repetitionAmount: repetitionAmount.value.value
            };
        };

        watch(() => repetitionStart.value.value, () => {
            console.log(repetitionStart.value.value)
        })

        onMounted(() => {
            if (props.initialData) {
                mode.value = props.initialData.mode || 'create';
                hasRepetition.value = props.initialData.hasRepetition ?? true;
                repetitionStart.value.value = props.initialData.repetitionStart || '';
                repeatTimeCycle.value.value = props.initialData.repeatTimeCycle || '';
                repetitionType.value = props.initialData.repetitionType || 'day';
                selectedDays.value = props.initialData.selectedDays || [];
                wholeDay.value = props.initialData.wholeDay ?? false;
                chosenTime.value.value = props.initialData.chosenTime || '';
                isReminder.value = props.initialData.isReminder ?? false;
                selectedReminder.value.value = props.initialData.selectedReminder || 15;
                repeatitionEnd.value.value = props.initialData.repeatitionEnd || 'date';
                repetitionAmount.value.value = props.initialData.repetitionAmount || '';
            } else {
                hasRepetition.value = true; // Default true on fresh open
            }
            initialSnapshot.value = JSON.stringify(getFormData());
        });

        const selectedReminder = ref({ value: 15, color: 'primary', message: '' });

        const reminderOptions = computed<DropdownOption[]>(() => {
            const m = t('general.timeframes.minutes');
            const h = t('general.timeframes.hours');
            const d = t('general.timeframes.days')

            return [
                { val: 5, unit: m, raw: 5 },
                { val: 10, unit: m, raw: 10 },
                { val: 15, unit: m, raw: 15 },
                { val: 30, unit: m, raw: 30 },
                { val: 1, unit: h, raw: 60 },
                { val: 2, unit: h, raw: 120 },
                { val: 1, unit: d, raw: 1440 }
            ].map(opt => ({
                label: t('calendar.form.reminderOption', { time: opt.val, unit: opt.unit }),
                value: opt.raw
            }));
        });


        const repetitionEndTypes = computed<DropdownOption[]>(() => [
            {
                label: t('calendar.form.repeatEnding.date'),
                value: 'date'
            },
            {
                label: t('calendar.form.repeatEnding.times'),
                value: 'times'
            }
        ])

        const isDirty = computed(() => {
            return JSON.stringify(getFormData()) !== initialSnapshot.value;
        });


        const buttonsProps = computed(() => {
            if (mode.value === 'create') {
                return [
                    { key: 'submit', color: 'primary', text: t('calendar.form.submit'), icon: '', disabled: hasErrors.value },
                    { key: 'back', color: 'secondary', text: t('calendar.form.back'), icon: '', disabled: false }
                ];
            }
            return [
                { key: 'submit', color: 'primary', text: t('calendar.form.save'), icon: '', disabled: hasErrors.value || !isDirty.value },
                { key: 'back', color: 'secondary', text: t('calendar.form.delete.delete'), icon: 'PhTrash', disabled: false }
            ];
        });

        watch(() => getFormData(), () => {
            hasErrors.value = false;
        }, { deep: true });

        // 4. Individual Watchers for resetting specific field styling when typing
        const clearField = (fieldRef: any) => {
            if (fieldRef.value.color === 'error') {
                fieldRef.value.color = 'primary';
                fieldRef.value.message = '';
            }
        };

        watch(() => repetitionStart.value.value, () => clearField(repetitionStart));
        watch(() => repeatTimeCycle.value.value, () => clearField(repeatTimeCycle));
        watch(() => repetitionAmount.value.value, () => clearField(repetitionAmount));
        watch(() => selectedDays.value, () => clearField(repeatTimeCycle), { deep: true });


        const endingDetailsProps = computed(() => {
            if (repeatitionEnd.value.value === 'date') return { placeholder: t('general.select'), title: t('calendar.form.repeatEnding.date'), type: 'date' }
            return { placeholder: t('general.write'), title: t('calendar.form.repeatEnding.times'), type: 'number' }
        })




        const selectOption = (key: RepetitionTypes) => {
            repetitionType.value = key;

        }

        const isSelected = (dayOfWeek: number) => {
            return selectedDays.value.includes(dayOfWeek);
        }

        const addSelection = (dayOfWeek: number) => {
            const index = selectedDays.value.indexOf(dayOfWeek);
            if (index > -1) selectedDays.value.splice(index, 1);
            else selectedDays.value.push(dayOfWeek);
        }

        watch(selectedDays, () => {
            if (repetitionType.value === 'custom') {
                repeatTimeCycle.value.value = selectedDaysLabels.value;
            }
        }, { deep: true });

        const selectedDaysLabels = computed(() => {
            return getWeekDayNames.value
                .filter(day => selectedDays.value.includes(day.dayOfWeek))
                .map(day => day.fullName)
                .join(' , ');
        });

        watch(repetitionType, (newVal) => {
            if (newVal !== 'custom') {
                selectedDays.value = [];
            }
            nextTick(() => {
                repeatTimeCycle.value.value = ''
                repetitionAmount.value.value = ''
            })
        });

        const handleButtonAction = (key: string) => {
            switch (key) {
                case 'submit':
                    validateFields()
                    break;
                case 'back':
                    emit('back')
                    break;
            }
        }

        const validateFields = () => {
            hasErrors.value = false;
            let isValid = true;

            // If user turned it off, skip validation entirely
            if (!hasRepetition.value) {
                submitFields();
                return;
            }

            const now = new Date();
            now.setHours(0, 0, 0, 0);

            if (!repetitionStart.value.value || new Date(repetitionStart.value.value) < now) {
                repetitionStart.value.color = 'error';
                repetitionStart.value.message = t('calendar.form.validation.pastDate');
                isValid = false;
            }

            if (repetitionType.value !== 'custom') {
                const cycle = Number(repeatTimeCycle.value.value);
                if (!repeatTimeCycle.value.value || isNaN(cycle) || cycle <= 0) {
                    repeatTimeCycle.value.color = 'error';
                    repeatTimeCycle.value.message = t('calendar.form.validation.positiveNumber');
                    isValid = false;
                }
            } else {
                if (selectedDays.value.length === 0) {
                    isValid = false; // Disable button silently or use a global toast
                }
            }

            if (repeatitionEnd.value.value === 'times') {
                const amount = Number(repetitionAmount.value.value);
                if (!repetitionAmount.value.value || isNaN(amount) || amount <= 0) {
                    repetitionAmount.value.color = 'error';
                    repetitionAmount.value.message = t('calendar.form.validation.positiveNumber');
                    isValid = false;
                }
            } else {
                if (!repetitionAmount.value.value || new Date(repetitionAmount.value.value) < now) {
                    repetitionAmount.value.color = 'error';
                    repetitionAmount.value.message = t('calendar.form.validation.pastDate');
                    isValid = false;
                }
            }

            if (!isValid) {
                hasErrors.value = true;
                return;
            }

            submitFields();
        };

        const submitFields = () => {
            // Mode emit handling requested by prompt
            if (mode.value === 'create') {
                emit('submit', getFormData());
            } else {
                emit('save-edit', getFormData());
            }
        };

        return {
            t,
            repetitionStart,
            hasRepetition,
            repetitionTypes,
            selectedReminder,
            chosenTime,
            repetitionAmount,
            repetitionType,
            handleButtonAction,
            endingDetailsProps,
            reminderOptions,
            repetitionEndTypes,
            repeatTimeCycle,
            wholeDay,
            isSelected,
            buttonsProps,
            isReminder,
            hasErrors,
            addSelection,
            mode,
            repeatitionEnd,
            selectOption,
            getWeekDayNames,
        }
    }
})
</script>