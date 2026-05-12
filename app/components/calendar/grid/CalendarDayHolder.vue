<template>
    <div class=" overflow-hidden border border-outline-variant/50 w-full relative h-full">
        <div class=" absolute top-0 left-0 z-10 w-full h-full p-4 flex flex-col">
            <div class=" shrink-0">
                <CalendarDayBadge :day="day" />
            </div>
            <div id="holder" class="w-full flex-1 flex flex-col gap-y-1.5 mt-2">
                <CalendarItemDisplay position="static" v-for="event in displayedEvents" :key="event.id"
                    :event="event" />

                <div v-if="remainingCount > 2" @click="openDay"
                    class="w-full h-9 px-2 flex cursor-pointer items-center rounded-lg bg-surface-variant text-label-sm text-on-surface select-none ">
                    {{ t('calendar.moreItems', { count: remainingCount }) }}
                </div>
            </div>
        </div>
        <div class="w-full h-full pointer-events-none absolute top-0 left-0">
            <CalendarPattern v-if="otherMonth" class="absolute inset-0 z-0 pointer-events-none" />
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, type PropType, computed } from 'vue';
import type { CalendarDay } from '~/types/components/calendar';
import CalendarDayBadge from './CalendarDayBadge.vue';
import OtherMonthsBackground from '/images/calendar/other-months.svg'
import CalendarPattern from './CalendarPattern.vue';
import CalendarItemDisplay from './CalendarItemDisplay.vue';
import { useI18n } from '#imports';
import type { CalendarEventPayload } from '~/types/calendar';
export default defineComponent({
    name: 'CalendarDayHolder',
    props: {
        day: {
            type: Object as PropType<CalendarDay>,
            required: true,
        },
        otherMonth: {
            type: Boolean,
            default: false,
        },
        events: {
            type: Array as PropType<CalendarEventPayload[]>,
            default: () => []
        },
    },
    components: {
        CalendarDayBadge,
        CalendarPattern,
        CalendarItemDisplay,
    },
    emits: ['open-day'],
    setup(props, { emit }) {
        const { t } = useI18n()

        const getDayItemColor = (day: CalendarDay) => {
            let fillStyle = 'border-outline-variant bg-surface'
            let textStyle = 'text-on-surface/50'
            if (day.isToday) {
                fillStyle = ' bg-diamond-black dark:bg-diamond-surface border-outline-variant/0'
                textStyle = 'text-surface'
            }
            if (day.isWeekend) {
                textStyle = 'text-error'
            }
            return {
                fill: fillStyle,
                text: textStyle,
            }
        }

        const displayedEvents = computed(() => props.events.slice(0, 2));
        const remainingCount = computed(() => props.events.length - 2);

        const openDay = () => {
            emit('open-day', props.day);
        }

        return {
            getDayItemColor,
            OtherMonthsBackground,
            t,
            displayedEvents,
            openDay,
            remainingCount,
        }
    }
})
</script>