<template>
    <div class=" w-full relative h-full">
        
    </div>
</template>
<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { CalendarDay } from '~/types/components/calendar';
import CalendarDayBadge from './CalendarDayBadge.vue';


export default defineComponent({
    name: 'CalendarDayHolder',
    props: {
        day: {
            type: Object as PropType<CalendarDay>,
            required: true,
        }
    },
    components: {
        CalendarDayBadge,
    },
    setup(props) {


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

        return {
            getDayItemColor,
        }
    }
})
</script>