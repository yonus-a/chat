<template>
    <div :style="wrapperStyle" :class="{ 'absolute px-2 lg:px-4 z-10': position !== 'static' }">
        <div :class="[
            'flex items-center overflow-hidden rounded-md cursor-pointer transition-transform active:scale-95 text-[11px] leading-[1.2]',
            // Mode Specific padding/height
            mode === 'monthly' ? 'px-2 mb-1 h-6 w-full shrink-0 whitespace-nowrap text-ellipsis' : 'px-4 w-full h-full',
            (mode === 'daily' || mode === 'weekly') ? 'shadow-sm border border-white/20' : ''
        ]" :style="contentStyle" @click="$emit('click', event)">
            <div class="flex items-center w-full gap-x-1">
                <span v-if="mode !== 'monthly'" class="font-bold opacity-80">{{ event.time }}</span>
                <span class="font-medium truncate">{{ event.title }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue';
import type { CalendarMode, CalendarTimeRange, CalendarDay } from '~/types/components/calendar';
import type { CalendarEventPayload } from '~/types/calendar';
export default defineComponent({
    name: 'CalendarEventItem',
    props: {
        event: { type: Object as PropType<CalendarEventPayload>, required: true },
        mode: { type: String as PropType<CalendarMode>, default: 'daily' },
        headers: { type: Array as PropType<CalendarDay[]>, default: () => [] },
        hours: { type: Object as PropType<CalendarTimeRange>, default: () => ({ start: 0, end: 24 }) },
        position: {
            type: String as PropType<'auto' | 'static'>,
            default: 'auto'
        }
    },
    setup(props) {
        const wrapperStyle = computed(() => {
            if (props.mode === 'monthly') return {};
            if (props.position === 'static') return {
                width: `100%`,
                height: `36px`
            }

            const dayIndex = props.headers.findIndex(h =>
                new Date(h.date).toDateString() === new Date(props.event.date).toDateString()
            );

            if (dayIndex === -1) return { display: 'none' };

            const totalHours = props.hours.end - props.hours.start;
            const [h, m] = props.event.time.split(':').map(Number);
            const eventStartDecimal = h + (m / 60);

            const topPercent = ((eventStartDecimal - props.hours.start) / totalHours) * 100;
            const columnWidth = 100 / props.headers.length;

            return {
                top: `${topPercent}%`,
                left: `${dayIndex * columnWidth}%`,
                width: `${columnWidth}%`,
                height: '36px',
            };
        });

        const contentStyle = computed(() => {
            if (props.mode === 'monthly') {
                return {
                    backgroundColor: props.event.color + '20',
                    borderLeft: `3px solid ${props.event.color}`,
                    color: props.event.color
                };
            }
            return {
                backgroundColor: props.event.color,
                color: '#fff'
            };
        });
        return { wrapperStyle, contentStyle };
    }
});
</script>