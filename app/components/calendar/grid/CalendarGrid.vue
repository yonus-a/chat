<template>
    <div class="w-full h-full max-h-full flex flex-col">
        <CalendarHeaderItem class="shrink-0" :mode="mode" :days="displayedHeader" />

        <div class="w-full flex-1 min-h-0 overflow-hidden">
            <div class="h-full w-full overflow-y-auto hide-scrollbar">
                <div class="flex items-stretch min-h-full w-full">

                    <div class="transition-all duration-300 ease-in-out shrink-0 overflow-hidden whitespace-nowrap"
                        :class="mode !== 'monthly' ? 'w-9 md:w-25 opacity-100' : 'w-0 opacity-0'">
                        <CalendarSideItem class="w-9 md:w-25 h-full" :range="hours" />
                    </div>

                    <div class="flex-1 relative overflow-hidden">
                        <CalendarPointer v-if="mode !== 'monthly'" :mode="mode" :hours="hours" :headers="headers" />

                        <Transition name="calendar-view">

                            <div v-if="mode !== 'monthly'" class="w-full h-full bg-surface"
                                :key="`time-grid-${mode}-${range?.start?.getTime() || 0}`">

                                <div class="absolute inset-0 pointer-events-none">
                                    <div class="relative w-full h-full pointer-events-auto">
                                        <CalendarItemDisplay v-for="event in visibleGridEvents" :key="event.id"
                                            :event="event" :mode="mode" :headers="headers" :hours="hours" />
                                    </div>
                                </div>

                                <div
                                    class="w-full absolute top-0 left-0 h-full pointer-events-none justify-between flex items-stretch">
                                    <div class="h-full border-surface-variant"
                                        :class="[n === headers.length + 1 || n === 1 ? 'border-0' : 'border']"
                                        v-for="n in headers.length + 1" :key="'v' + n">
                                    </div>
                                </div>

                                <div
                                    class="w-full absolute top-0 left-0 h-full flex-col pointer-events-none justify-between flex items-stretch">
                                    <div class="w-full border border-surface-variant"
                                        :class="[n === 0 || n === 1 ? 'opacity-0' : 'opacity-100']"
                                        v-for="n in (hours.end - hours.start + 2)" :key="'h' + n">
                                    </div>
                                </div>
                            </div>

                            <div v-else class="w-full grid grid-cols-7 auto-rows-[186px] bg-surface"
                                :key="`monthly-view-${range?.start?.getTime() || 0}`">
                                <CalendarDayHolder v-for="(day, index) in headers" :key="index" :day="day"
                                    :events="eventsByDay.get(new Date(day.date).toDateString()) || []"
                                    :other-month="isOtherMonth(day.date)" @open-day="openSpecificDay(day)" />
                            </div>

                        </Transition>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, type PropType, computed } from 'vue';
import { useCalendarDate } from '~/composables/calendar/useCalendarDate';
import type { CalendarMode, CalendarDateRange, CalendarTimeRange, CalendarDay } from '~/types/components/calendar';
import type { CalendarEventPayload } from '~/types/calendar';
import CalendarHeaderItem from './CalendarHeaderItem.vue';
import CalendarSideItem from './CalendarSideItem.vue';
import CalendarDayHolder from './CalendarDayHolder.vue';
import CalendarPointer from './CalendarPointer.vue';
import CalendarItemDisplay from './CalendarItemDisplay.vue';

export default defineComponent({
    name: 'CalendarGrid',
    components: {
        CalendarHeaderItem,
        CalendarSideItem,
        CalendarDayHolder,
        CalendarPointer,
        CalendarItemDisplay,
    },
    props: {
        range: {
            type: Object as PropType<CalendarDateRange | null>,
            required: true,
        },
        mode: {
            type: String as PropType<CalendarMode>,
            default: 'monthly'
        },
        hours: {
            type: Object as PropType<CalendarTimeRange>,
            default: () => ({ start: 0, end: 24 })
        },
        events: {
            type: Array as PropType<CalendarEventPayload[]>,
            default: () => []
        }
    },
    emits: ['update:mode', 'update:range'],
    setup(props, { emit }) {
        const { getCalendarHeaders, getParts } = useCalendarDate();

        const columnWidths = computed(() => `${100 / (headers.value.length + (props.mode == 'monthly' ? 0 : 1))}%`);

        const headers = computed(() => {
            return getCalendarHeaders(props.range, props.mode);
        });

        const displayedHeader = computed(() => {
            if (props.mode !== 'monthly') return headers.value;
            return headers.value.slice(0, 7);
        });

        const isOtherMonth = (date: Date) => {
            if (props.mode !== 'monthly' || !props.range) return false;
            const midMonthAnchor = new Date(props.range.start);
            midMonthAnchor.setDate(midMonthAnchor.getDate() + 15);
            const target = getParts(midMonthAnchor);
            const current = getParts(date);
            return target.month !== current.month || target.year !== current.year;
        };

        // Groups events for Monthly view
        const eventsByDay = computed(() => {
            const map = new Map<string, CalendarEventPayload[]>();

            props.events.forEach(event => {
                const dateKey = new Date(event.date).toDateString();
                if (!map.has(dateKey)) map.set(dateKey, []);
                map.get(dateKey)?.push(event);
            });

            map.forEach(list => {
                list.sort((a, b) => b.time.localeCompare(a.time));
            });

            return map;
        });

        // Filters events for Daily/Weekly view
        const visibleGridEvents = computed(() => {
            if (props.mode === 'monthly') return [];
            return props.events.filter(e => {
                const hour = parseInt(e.time.split(':'));
                return hour >= props.hours.start && hour < props.hours.end;
            });
        });

        // Triggered when "X More Items" is clicked inside CalendarDayHolder
        const openSpecificDay = (day: CalendarDay) => {
            const start = new Date(day.date);
            start.setHours(0, 0, 0, 0);

            const end = new Date(day.date);
            end.setHours(23, 59, 59, 999);

            emit('update:mode', 'daily', new Date(day.date));
        };

        return {
            headers,
            isOtherMonth,
            columnWidths,
            displayedHeader,
            eventsByDay,
            visibleGridEvents,
            openSpecificDay
        }
    }
})
</script>

<style scoped>
.calendar-view-enter-active,
.calendar-view-leave-active {
    transition: all 0.2s ease-out;
    position: absolute !important;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    will-change: transform, opacity;
    z-index: 10;
}

.calendar-view-enter-from {
    opacity: 0;
    transform: scale(1.02);
}

.calendar-view-leave-to {
    opacity: 0;
    transform: scale(0.98);
}
</style>