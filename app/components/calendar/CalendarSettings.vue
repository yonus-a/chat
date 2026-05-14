<template>
    <div class=" w-full flex justify-center">
        <div class=" px-6 py-4 w-98 max-w-dvw select-none text-on-surface">
            <div class=" flex items-center gap-x-3">
                <BIcon icon="PhX" class=" cursor-pointer w-4 h-4 " @click="closeSettings" />
                <div class=" flex items-center text-label-sm">{{ t('calendar.filters.title') }}</div>
            </div>
            <BCheckBox v-model="showHolidays" :label="t('calendar.filters.showHolidays')" class=" mt-4" />
            <div class=" w-full mt-4">
                <BSelect :options="calendarOptions" :title="t('calendar.filters.calendar.title')"
                    :placeholder="t('general.select')" v-model="chosenCalendar" />
                <BSelect :options="startOfWeekOptions" :title="t('calendar.filters.startOfWeek')"
                    :placeholder="t('general.select')" v-model="chosenStartOfWeek" />
                <BSelect searchable :options="timeZoneOptions" :title="t('calendar.filters.timeZone')"
                    :placeholder="t('general.select')" v-model="chosenTimeZone" />
                <div class=" w-1/3 flex flex-col gap-y-3">
                    <div class=" text-body-sm opacity-50">{{ t('calendar.filters.displaySettings.title') }}</div>
                    <BCheckBox v-model="showAi" :label="t('calendar.filters.displaySettings.ai')" />
                    <BCheckBox v-model="showMedicine" :label="t('calendar.filters.displaySettings.medicine')" />
                    <BCheckBox v-model="showServices" :label="t('calendar.filters.displaySettings.services')" />
                    <BCheckBox v-model="showTasks" :label="t('calendar.filters.displaySettings.task')" />
                </div>
                <div class=" mt-4 w-full">
                    <BButton :disabled="!hasChanges" class=" min-w-full" :text="t('calendar.filters.apply')"
                        @click="applyFilters" />
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useI18n, useCalendarStore } from '#imports';
import type { CalendarSettingsPayload } from '~/types/calendar';
import type { DropdownOption } from '~/types/components/select';

export default defineComponent({
    name: 'CalendarSettings',
    emits: ['close'],
    setup(_, { emit }) {
        const { t } = useI18n();
        const calendarStore = useCalendarStore();

        // 1. Local state matching the payload
        const chosenCalendar = ref<'jalaali' | 'georgian' | 'islamic'>('jalaali');
        const chosenStartOfWeek = ref('');
        const chosenTimeZone = ref('');
        const showAi = ref(true);
        const showMedicine = ref(true);
        const showServices = ref(true);
        const showTasks = ref(true);
        const showHolidays = ref(true);

        const initialSettings = ref<CalendarSettingsPayload | null>(null);

        // 2. Options for Dropdowns
        const calendarOptions = computed<DropdownOption[]>(() => [
            { label: t('calendar.filters.calendar.jalaali'), value: 'jalaali' },
            { label: t('calendar.filters.calendar.georgian'), value: 'georgian' },
            { label: t('calendar.filters.calendar.islamic'), value: 'islamic' },
        ]);

        const startOfWeekOptions = computed<DropdownOption[]>(() => [
            { label: t('calendar.filters.startOfWeekOptions.saturday'), value: 'saturday' },
            { label: t('calendar.filters.startOfWeekOptions.sunday'), value: 'sunday' },
            { label: t('calendar.filters.startOfWeekOptions.monday'), value: 'monday' },
            { label: t('calendar.filters.startOfWeekOptions.tuesday'), value: 'tuesday' },
            { label: t('calendar.filters.startOfWeekOptions.wednesday'), value: 'wednesday' },
            { label: t('calendar.filters.startOfWeekOptions.thursday'), value: 'thursday' },
            { label: t('calendar.filters.startOfWeekOptions.friday'), value: 'friday' },
        ]);

        const timeZoneOptions = computed<DropdownOption[]>(() => {
            try {
                const zones = Intl.supportedValuesOf('timeZone');

                return zones.map(zone => {
                    const readableLabel = zone.replace(/_/g, ' ').replace(/\//g, ' - ');
                    return {
                        label: readableLabel,
                        value: zone
                    };
                });
            } catch (e) {
                return [{ label: 'Asia - Tehran', value: 'Asia/Tehran' }];
            }
        });

        // 3. Initialize data from store
        const initData = () => {
            const current = calendarStore.settings;
            chosenCalendar.value = current.calendar;
            chosenStartOfWeek.value = current.startOfWeek;
            chosenTimeZone.value = current.timeZone;
            showHolidays.value = current.showHolidays;
            showAi.value = current.showAi;
            showMedicine.value = current.showMedicine;
            showServices.value = current.showServices;
            showTasks.value = current.showTasks;

            // Deep copy to prevent reference mutation
            initialSettings.value = JSON.parse(JSON.stringify(current));
        };

        onMounted(initData);

        // 4. Dirty Check
        const hasChanges = computed(() => {
            if (!initialSettings.value) return false;

            return chosenCalendar.value !== initialSettings.value.calendar ||
                chosenStartOfWeek.value !== initialSettings.value.startOfWeek ||
                chosenTimeZone.value !== initialSettings.value.timeZone ||
                showHolidays.value !== initialSettings.value.showHolidays ||
                showAi.value !== initialSettings.value.showAi ||
                showMedicine.value !== initialSettings.value.showMedicine ||
                showServices.value !== initialSettings.value.showServices ||
                showTasks.value !== initialSettings.value.showTasks;
        });

        const closeSettings = () => {
            // Revert unsaved changes on close
            initData();
            emit('close');
        };

        const applyFilters = () => {
            const payload: CalendarSettingsPayload = {
                calendar: chosenCalendar.value,
                startOfWeek: chosenStartOfWeek.value,
                timeZone: chosenTimeZone.value,
                showHolidays: showHolidays.value,
                showAi: showAi.value,
                showMedicine: showMedicine.value,
                showServices: showServices.value,
                showTasks: showTasks.value,
            };

            calendarStore.updateSettings(payload);

            // Update initial settings so the button disables again
            initialSettings.value = JSON.parse(JSON.stringify(payload));
            emit('close');
        };



        return {
            t,
            chosenCalendar,
            chosenStartOfWeek,
            chosenTimeZone,
            showHolidays,
            showAi,
            showMedicine,
            showServices,
            hasChanges,
            showTasks,
            applyFilters,
            closeSettings,
            calendarOptions,
            startOfWeekOptions,
            timeZoneOptions
        };
    }
});
</script>