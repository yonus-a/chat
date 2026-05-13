<template>
    <div class="w-dvw max-w-91.5 p-2 min-h-73 ">
        <!--  
            <div class="w-full flex items-center justify-between mb-4">
                <div class="flex items-center gap-x-2 text-on-surface/50">
                    <BIcon icon="PhX" class="w-4 h-4 cursor-pointer " @click="close" />
                    <div class="flex gap-x-1.5 text-label-sm select-none">
                        {{ t('general.datePicker.title') }}
                    </div>
                </div>
                
            </div>
            -->
        <div class="flex pb-6 w-full select-none text-label-md items-center justify-between gap-x-4 text-on-surface ">
            <div @click="toggleView('months')" class="cursor-pointer flex items-center gap-x-2">
                <div>{{ currentMonthLabel }}</div>
                <BIcon icon="PhCaretDown"
                    class="fill-on-surface/50 text-label-md w-4 h-4 transition-transform duration-300 ease-in-out"
                    :class="[viewMode === 'months' ? 'rotate-180' : 'rotate-0']" />
            </div>
            <div @click="toggleView('years')" class="cursor-pointer flex items-center gap-x-2">
                <div>{{ currentYearLabel }}</div>
                <BIcon icon="PhCaretDown"
                    class="fill-on-surface/50 text-label-md w-4 h-4 transition-transform duration-300 ease-in-out"
                    :class="[viewMode === 'years' ? 'rotate-180' : 'rotate-0']" />
            </div>
        </div>
        <div class="relative w-full transition-all duration-300 ease-in-out">
            <div :class="[viewMode == 'years' ? 'opacity-100' : 'opacity-0']"
                class=" transition-all pointer-events-none duration-200 rotate-180 ease-in-out w-full absolute z-10 top-0 bottom-0 bg-linear-to-t from-surface to-surface/0 h-6">
            </div>
            <Transition name="view-fade" mode="out-in">
                <div v-if="viewMode === 'days'" key="days" class="w-full select-none">
                    <div class="grid grid-cols-7 w-full mb-6">
                        <div v-for="day in weekDays" :key="day.dayOfWeek"
                            class="text-center text-on-surface/50 text-[10px] opacity-50 py-1">
                            {{ day.fullName }}
                        </div>
                    </div>
                    <div class="grid grid-cols-7 w-full gap-x-2 gap-y-4">
                        <div v-for="(day, idx) in daysGrid" :key="idx"
                            @click="day.isCurrentMonth && selectDay(day.date)"
                            class="flex items-center justify-center transition-all duration-200"
                            :class="[!day.isCurrentMonth ? 'opacity-20 pointer-events-none' : 'cursor-pointer']">

                            <div class="rounded-full flex items-center justify-center transition-all duration-200"
                                :class="isSameDay(day.date, chosenDate) ? 'bg-diamond-black' : 'bg-transparent'">

                                <div class="w-8 h-8 flex items-center justify-center border text-label-md rounded-full transition-all duration-200"
                                    :class="[
                                        isSameDay(day.date, chosenDate) ? 'bg-diamond-black dark:bg-diamond-gray' : 'bg-transparent',
                                        day.isToday && !isSameDay(day.date, chosenDate) ? 'border-primary font-semibold' : 'border-primary/0',
                                        !isSameDay(day.date, chosenDate) && day.isCurrentMonth ? 'hover:bg-surface-variant' : '',
                                        isSameDay(day.date, chosenDate)
                                            ? 'text-surface'
                                            : (day.isWeekend && day.isCurrentMonth
                                                ? 'text-error font-medium'
                                                : (day.isToday ? 'text-primary' : 'text-on-surface'))
                                    ]">
                                    {{ day.primary }}
                                </div>

                            </div>

                        </div>
                    </div>
                </div>
                <div v-else-if="viewMode === 'months'" key="months"
                    class="grid grid-cols-3 gap-2 overflow-y-auto max-h-64 hide-scrollbar select-none">
                    <div v-for="m in getMonths" :key="m.key" @click="selectMonth(m.key)"
                        class="flex items-center h-10 justify-center rounded-lg cursor-pointer text-on-surface text-label-md transition-all duration-200 ease-in-out"
                        :class="m.key === String(viewParts.month) ? 'p-0.5 bg-diamond-primary-secondary text-on-primary' : 'p-0.5 bg-outline-variant'">
                        <div
                            class="transition-all duration-200 ease-in-out flex rounded-md items-center bg-surface justify-center min-h-full w-full h-full">
                            <div>{{ m.label }}</div>
                        </div>
                    </div>
                </div>
                <div v-else-if="viewMode === 'years'" key="years"
                    class="w-full h-[260px] overflow-y-auto hide-scrollbar select-none" ref="yearListContainer">
                    <div :style="{ height: `${rowVirtualizer.getTotalSize()}px` }" class="relative w-full">

                        <div v-for="virtualRow in rowVirtualizer.getVirtualItems()" :key="virtualRow.index"
                            class="absolute top-0 left-0 w-full grid grid-cols-3 gap-2"
                            :style="{ height: `${virtualRow.size}px`, transform: `translateY(${virtualRow.start}px)` }">

                            <div v-for="y in yearRows[virtualRow.index]" :key="y.key" @click="selectYear(y.key)"
                                class="flex items-center h-10 justify-center rounded-lg cursor-pointer text-on-surface text-label-md transition-all duration-200 ease-in-out"
                                :class="y.key === String(viewParts.year) ? 'p-0.5 bg-diamond-primary-secondary text-on-primary' : 'p-0.5 bg-outline-variant'">

                                <div
                                    class="transition-all duration-200 ease-in-out bg-surface flex rounded-md items-center justify-center min-h-full w-full h-full">
                                    <div>{{ y.label }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
            <div :class="[viewMode == 'years' ? 'opacity-100' : 'opacity-0']"
                class=" transition-all pointer-events-none duration-200 ease-in-out w-full absolute z-10 left-0 bottom-0 bg-linear-to-t from-surface to-surface/0 h-6">
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, nextTick } from 'vue';
import { useCalendarDate } from '~/composables/calendar/useCalendarDate';
import { useVirtualizer } from '@tanstack/vue-virtual';
import { useI18n } from '#imports';


export default defineComponent({
    name: 'DatePicker',
    props: {
        modelValue: {
            type: Date,
            default: () => new Date(),
        }
    },
    emits: ['close', 'update:modelValue'],
    setup(props, { emit }) {
        const { t } = useI18n()
        const { getYears, getMonths, getParts, getMonthBounds, setTargetMonth, getCalendarHeaders, getWeekDayNames } = useCalendarDate();

        const viewMode = ref<'days' | 'months' | 'years'>('days');
        const chosenDate = ref(new Date(props.modelValue));
        const viewDate = ref(new Date(props.modelValue)); // Tracks the currently browsed month/year
        const yearListContainer = ref<HTMLElement | null>(null);


        // UI Labels
        const viewParts = computed(() => getParts(viewDate.value));
        const currentMonthLabel = computed(() => getMonths.value.find(m => m.key === String(viewParts.value.month))?.label);
        const currentYearLabel = computed(() => getYears.value.find(y => y.key === String(viewParts.value.year))?.label);
        const weekDays = computed(() => getWeekDayNames.value);

        const yearRows = computed(() => {
            const rows = [];
            const years = getYears.value;
            for (let i = 0; i < years.length; i += 3) {
                rows.push(years.slice(i, i + 3));
            }
            return rows;
        });

        // 2. Virtualize the ROWS, not the items
        const rowVirtualizer = useVirtualizer({
            get count() { return yearRows.value.length; },
            getScrollElement: () => yearListContainer.value,
            estimateSize: () => 48, // 40px height + 8px gap
            overscan: 5,
        });

        // Generate the 42-day calendar grid based on the "viewDate"
        const daysGrid = computed(() => {
            const bounds = getMonthBounds(viewDate.value);
            const gridDays = getCalendarHeaders({ start: bounds.start, end: bounds.end }, 'monthly');

            return gridDays.map(day => {
                const parts = getParts(day.date);
                return {
                    ...day,
                    isCurrentMonth: parts.month === viewParts.value.month
                };
            });
        });

        // Month Navigation
        const adjustMonth = (offset: number) => {
            let targetMonth = viewParts.value.month + offset;
            let targetYear = viewParts.value.year;

            // Handle year wrapping
            if (targetMonth > 12) {
                targetMonth = 1;
                targetYear++;
            } else if (targetMonth < 1) {
                targetMonth = 12;
                targetYear--;
            }

            viewDate.value = setTargetMonth(targetYear, targetMonth, viewDate.value);
        };

        // Selectors
        const selectMonth = (monthKey: string) => {
            viewDate.value = setTargetMonth(viewParts.value.year, parseInt(monthKey), viewDate.value);
            viewMode.value = 'days';
        };

        const selectYear = (yearKey: string) => {
            viewDate.value = setTargetMonth(parseInt(yearKey), viewParts.value.month, viewDate.value);
            viewMode.value = 'months';
        };

        const selectDay = (date: Date) => {
            chosenDate.value = date;
            viewDate.value = new Date(date); // Snap view to selected date
            emit('update:modelValue', date);
            close(); // Usually, picking a day closes the picker. Remove this line if you want it to stay open.
        };

        // Deep Date Comparator ignoring time
        const isSameDay = (d1: Date, d2: Date) => {
            const p1 = getParts(d1);
            const p2 = getParts(d2);
            return p1.year === p2.year && p1.month === p2.month && p1.day === p2.day;
        };

        // Auto-Scroll to the active year when opening the "years" view
        const toggleView = (mode: 'months' | 'years') => {
            viewMode.value = viewMode.value === mode ? 'days' : mode;
        };


        // 3. Update the smooth scroll watcher
        watch(viewMode, (mode) => {
            if (mode === 'years') {
                nextTick(() => {
                    setTimeout(() => {
                        const targetYearStr = String(viewParts.value.year);
                        const rowIndex = yearRows.value.findIndex(row => row.some(y => y.key === targetYearStr));

                        if (rowIndex > -1) {
                            rowVirtualizer.value.scrollToIndex(rowIndex, { align: 'center', behavior: 'smooth' });
                        }
                    }, 300);
                });
            }
        });

        const close = () => {
            emit('close');
        };

        return {
            close,
            viewMode,
            chosenDate,
            viewDate,
            viewParts,
            currentMonthLabel,
            currentYearLabel,
            weekDays,
            toggleView,
            daysGrid,
            getMonths,
            getYears,
            rowVirtualizer,
            yearListContainer,
            adjustMonth,
            selectMonth,
            yearRows,
            selectYear,
            selectDay,
            isSameDay,
            t,
        };
    }
});
</script>
<style scoped>
/* Smooth View Transition Animations */
.view-fade-enter-active,
.view-fade-leave-active {
    transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.view-fade-enter-from {
    opacity: 0;
    transform: scale(0.97) translateY(5px);
}

.view-fade-leave-to {
    opacity: 0;
    transform: scale(0.97) translateY(-5px);
}
</style>