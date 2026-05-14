<template>
    <div class=" px-8 py-3 md:py-5 w-full flex justify-center md:justify-between shrink-0 items-center">
        <div class=" flex items-center gap-x-4">
            <div class=" flex items-center gap-x-2">
                <div @click="prevStep"
                    class=" w-10 aspect-square flex items-center justify-center cursor-pointer border border-outline rounded-xl">
                    <BIcon icon="PhCaretRight" class="rtl:rotate-0 ltr:rotate-180 w-5 h-5 fill-on-surface/50" />
                </div>
                <div @click="nextStep"
                    class=" w-10 aspect-square hidden md:flex items-center justify-center cursor-pointer border border-outline rounded-xl">
                    <BIcon icon="PhCaretLeft" class=" rtl:rotate-0 ltr:rotate-180 w-5 h-5 fill-on-surface/50" />
                </div>
                <BTab mode="fill" :tabs="displayModes" v-model="currentDisplayMode" />
                <div @click="nextStep"
                    class=" w-10 aspect-square md:hidden flex items-center justify-center cursor-pointer border border-outline rounded-xl">
                    <BIcon icon="PhCaretLeft" class=" rtl:rotate-0 ltr:rotate-180 w-5 h-5 fill-on-surface/50" />
                </div>
            </div>
            <div class=" hidden md:flex items-center gap-x-4">
                <BMenu @select="handleYearSelect" :options="getYears">
                    <template #trigger="{ isOpen }">
                        <div class=" flex cursor-pointer items-center py-1.5 px-3 gap-x-2">
                            <div class=" select-none text-label-md text-on-surface">{{ selectedYearText }}</div>
                            <BIcon icon="PhCaretDown" :class="[isOpen ? ' rotate-180' : ' rotate-0']"
                                class=" w-5 aspect-square transition-all duration-200 ease-in-out fill-on-surface/50" />
                        </div>
                    </template>

                </BMenu>
                <BMenu :options="getMonths" @select="handleMonthSelect">
                    <template #trigger="{ isOpen }">
                        <div class=" flex cursor-pointer items-center py-1.5 px-3 gap-x-2">
                            <div class=" select-none text-label-md text-on-surface">{{ selectedMonthText }}</div>
                            <BIcon icon="PhCaretDown" :class="[isOpen ? ' rotate-180' : ' rotate-0']"
                                class=" w-5 aspect-square transition-all duration-200 ease-in-out fill-on-surface/50" />
                        </div>
                    </template>
                </BMenu>
            </div>
        </div>
        <div class=" hidden md:flex items-center gap-x-2">
            <BButton @click="handleOption(option.key)" v-for="option in optionButtons" :key="option.key"
                :icon="option.icon" :disabled="option.disabled && option.disabled === true" color="secondary" />
            <BMenu ref="settingsMenu">
                <template #trigger>
                    <BButton icon="PhGear" color="secondary" />
                </template>
                <CalendarSettings @close="closeMenu" />
            </BMenu>
            <BButton @click="handleOption('add')" :text="t('calendar.addEvent')" color="primary" right-icon="PhPlus" />
        </div>
    </div>
    <div class=" w-full md:hidden flex justify-between items-center">
        <BMenu @select="handleYearSelect" :options="getYears">
            <template #trigger="{ isOpen }">
                <div class=" flex cursor-pointer items-center py-1.5 px-3 gap-x-2">
                    <div class=" select-none text-label-md text-on-surface">{{ selectedYearText }}</div>
                    <BIcon icon="PhCaretDown" :class="[isOpen ? ' rotate-180' : ' rotate-0']"
                        class=" w-5 aspect-square transition-all duration-200 ease-in-out fill-on-surface/50" />
                </div>
            </template>

        </BMenu>
        <BMenu :options="getMonths" @select="handleMonthSelect">
            <template #trigger="{ isOpen }">
                <div class=" flex cursor-pointer items-center py-1.5 px-3 gap-x-2">
                    <div class=" select-none text-label-md text-on-surface">{{ selectedMonthText }}</div>
                    <BIcon icon="PhCaretDown" :class="[isOpen ? ' rotate-180' : ' rotate-0']"
                        class=" w-5 aspect-square transition-all duration-200 ease-in-out fill-on-surface/50" />
                </div>
            </template>
        </BMenu>
    </div>
    <Teleport v-if="isMobile" to="#header-custom-actions">
        <div class=" flex md:hidden items-center gap-x-2">
            <BButton @click="handleOption(option.key)" v-for="option in optionButtons" :key="option.key"
                :icon="option.icon" :disabled="option.disabled && option.disabled === true" color="secondary" />
        </div>
    </Teleport>
    <BPopup ref="popup">
        <CalendarSettings @close="closeSettings" />
    </BPopup>
</template>
<script lang="ts">
import { defineComponent, useTemplateRef, computed } from 'vue';
import { useI18n, useCalendarStore, useWindowSize } from '#imports';
import { useCalendarDate } from '~/composables/calendar/useCalendarDate';
import { useEventBus } from '@vueuse/core';
import type { Popup } from '~/types/components/popup';
import CalendarSettings from './CalendarSettings.vue';
import type { Menu } from '~/types/components/menu';
export interface CalendarHeaderExposed {
    setTab: (tab: string, targetDate?: Date) => void;
}
export default defineComponent({
    name: 'CalendarHeader',
    emits: ['update:range', 'update:mode', 'share', 'refresh', 'add'],
    components: {
        CalendarSettings,
    },
    setup(_, { emit, expose }) {
        const { t, locale } = useI18n()
        const calendar = useCalendarDate()
        const calendarStore = useCalendarStore()
        const isSyncingCalendar = computed(() => calendarStore.isLoadingCalendar)
        const { width } = useWindowSize()
        const isMobile = computed(() => width.value < 768)
        const bus = useEventBus<any>('calendar-actions');
        const popup = useTemplateRef<Popup>('popup')
        const settingsMenu = useTemplateRef<Menu>('settingsMenu')

        // Source of truth. Start at today.
        const currentDate = ref(new Date())
        const currentDisplayMode = ref(2)

        const selectedYearIndex = computed({
            get: () => calendar.getYearIndex(calendar.getParts(currentDate.value).year),
            set: (idx) => {
                const targetY = parseInt(calendar.getYears.value[idx].key);
                const p = calendar.getParts(currentDate.value);
                currentDate.value = calendar.setTargetMonth(targetY, p.month, currentDate.value);
            }
        })

        const selectedMonthIndex = computed({
            get: () => calendar.getMonthIndex(calendar.getParts(currentDate.value).month),
            set: (idx) => {
                const targetM = parseInt(calendar.getMonths.value[idx].key);
                const p = calendar.getParts(currentDate.value);
                currentDate.value = calendar.setTargetMonth(p.year, targetM, currentDate.value);
            }
        })

        const displayModes = computed(() => [
            t('calendar.modes.daily'),
            t('calendar.modes.weekly'),
            t('calendar.modes.monthly'),
        ])

        const optionButtons = computed(() => {
            const options = [
                {
                    key: 'share',
                    icon: 'PhShareNetwork',
                    disabled: false,
                },
                {
                    key: 'sync',
                    icon: 'PhArrowsClockwise',
                    disabled: isSyncingCalendar.value
                },
                {
                    key: 'settings',
                    icon: 'PhGear',
                    // This now reactively tracks the computed isMobile
                    disabled: !isMobile.value
                }
            ];

            // Filter out anything where disabled is true
            return options.filter((opt) => !opt.disabled);
        });

        watch(() => isMobile.value, () => {
            console.log('is mobile:', isMobile.value)
        })
        watch(() => width.value, () => {
            console.log('width:', width.value)
        })

        const handleOption = (key: string) => {
            switch (key) {
                case 'share':
                    bus.emit({ type: 'share-calendar' });
                    break;
                case 'sync':
                    emit('refresh')
                    break;
                case 'settings':
                    popup.value?.open()
                    break;
                case 'add':
                    emit('add')
                    break;
            }
        }

        const closeSettings = () => {
            popup.value?.close()
        }

        watch([
            currentDate,
            currentDisplayMode,
            () => calendarStore.settings.calendar,
            () => calendarStore.settings.startOfWeek
        ], ([newDate, newMode], [oldDate, oldMode]) => {

            // 1. Only emit mode update when the index actually changes
            // Added undefined check to prevent firing on initial mount if not needed
            if (newMode !== oldMode && oldMode !== undefined) {
                const modeMap: Record<number, 'daily' | 'weekly' | 'monthly'> = {
                    0: 'daily',
                    1: 'weekly',
                    2: 'monthly'
                };
                emit('update:mode', modeMap[newMode]);
            }

            // 2. Range calculation logic
            const mode = newMode;
            let start: Date, end: Date;

            if (mode === 0) { // Daily
                start = new Date(new Date(currentDate.value).setHours(0, 0, 0, 0));
                end = new Date(new Date(currentDate.value).setHours(23, 59, 59, 999));
            } else if (mode === 1) { // Weekly
                const day = currentDate.value.getDay();

                // Map string from settings to JS day
                const weekStartMap: Record<string, number> = {
                    sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
                    thursday: 4, friday: 5, saturday: 6
                };
                const weekStart = weekStartMap[calendarStore.settings.startOfWeek] ?? 0;

                const diff = (day < weekStart ? 7 : 0) + day - weekStart;

                start = new Date(currentDate.value);
                start.setDate(start.getDate() - diff);
                start.setHours(0, 0, 0, 0);

                end = new Date(start);
                end.setDate(end.getDate() + 6);
                end.setHours(23, 59, 59, 999);
            } else { // Monthly
                const bounds = calendar.getMonthBounds(currentDate.value);
                start = bounds.start;
                end = bounds.end;
            }

            // 3. Emit the newly calculated range to the parent (CalendarPage)
            emit('update:range', { start, end });
        }, { immediate: true });

        const handleYearSelect = (option: any) => {
            const key = typeof option === 'object' ? option.key : option;
            const index = calendar.getYearIndex(key);
            if (index !== -1) selectedYearIndex.value = index;
        }

        const handleMonthSelect = (option: any) => {
            const key = typeof option === 'object' ? option.key : option;
            const index = calendar.getMonthIndex(key);
            if (index !== -1) selectedMonthIndex.value = index;
        }


        const getInitialMonthIndex = () => {
            const calendarMap = { ar: 'islamic-uma', en: 'gregory', fa: 'persian' }
            const calendar = calendarMap[locale.value as keyof typeof calendarMap] || 'gregory'
            const mFormatter = new Intl.DateTimeFormat(`en-u-ca-${calendar}`, { month: 'numeric' })
            const mKey = mFormatter.format(new Date()).replace(/[^0-9]/g, '')
            return calendar.getMonthIndex(mKey)
        }



        const selectedYearText = computed(() => calendar.getYears.value[selectedYearIndex.value]?.label || '...')
        const selectedMonthText = computed(() => calendar.getMonths.value[selectedMonthIndex.value]?.label || '...')

        // NAVIGATION LOGIC (Seamlessly crosses boundaries)
        const nextStep = () => {
            const d = new Date(currentDate.value);
            if (currentDisplayMode.value === 0) d.setDate(d.getDate() + 1);
            else if (currentDisplayMode.value === 1) d.setDate(d.getDate() + 7);
            else {
                // Monthly step: Jump 32 days safely into next month, then snap to day 1
                d.setDate(d.getDate() + 32);
                d.setTime(calendar.getMonthBounds(d).start.getTime());
            }
            currentDate.value = d;
        }

        const prevStep = () => {
            const d = new Date(currentDate.value);
            if (currentDisplayMode.value === 0) d.setDate(d.getDate() - 1);
            else if (currentDisplayMode.value === 1) d.setDate(d.getDate() - 7);
            else {
                // Monthly step: Jump back safely, then snap to day 1
                const bounds = calendar.getMonthBounds(d);
                bounds.start.setDate(bounds.start.getDate() - 2);
                d.setTime(calendar.getMonthBounds(bounds.start).start.getTime());
            }
            currentDate.value = d;
        }


        const setTab = (key: string, targetDate?: Date) => {
            const modeMap = {
                'daily': 0,
                'weekly': 1,
                'monthly': 2,
            };

            if (key in modeMap) {
                if (targetDate) {
                    currentDate.value = new Date(targetDate);
                }
                currentDisplayMode.value = modeMap[key as keyof typeof modeMap];
            } else {
                console.warn(`Invalid tab key: ${key}`);
            }
        };
        expose({
            setTab
        } as CalendarHeaderExposed);

        const closeMenu = () => {
            settingsMenu.value?.close()
        }

        return {
            t,
            handleMonthSelect,
            handleYearSelect,
            handleOption,
            getInitialMonthIndex,
            getYears: calendar.getYears,
            getMonths: calendar.getMonths,
            closeSettings,
            isMobile,
            prevStep,
            nextStep,
            selectedYearText,
            selectedMonthText,
            closeMenu,
            popup,
            settingsMenu,
            currentDisplayMode,
            optionButtons,
            displayModes,
        }
    }
})
</script>