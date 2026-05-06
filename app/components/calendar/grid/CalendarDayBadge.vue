<template>
    <div  class=" flex flex-col  items-center">
        <div class=" w-9 h-9 select-none border flex flex-col justify-center items-center rounded-full"
            :class="[getDayItemColor.fill, getDayItemColor.text]">
            <div :class="[getFont('tertiary', day)]" class=" leading-2 text-[8px]">{{ day.tertiary }}</div>
            <div :class="[getFont('primary', day)]" class=" leading-3.5 text-label-md">{{ day.primary }}</div>
            <div :class="[getFont('secondary', day)]" class=" leading-2 text-[8px]">{{ day.secondary }}</div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue';
import type { CalendarDay, CalendarMode } from '~/types/components/calendar';

export default defineComponent({
    name: 'CalendarDayBadge',
    props: {
        day: {
            type: Object as PropType<CalendarDay>,
            required: true,
        },
    },
    setup(props) {


        const getDayItemColor = computed(() => {
            let day = props.day
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
        })

        const getFont = (key: 'primary' | 'secondary' | 'tertiary', day: CalendarDay) => {
            if (day.gregorian === day[key]) {
                return 'font-latin'
            }
        }


        return {
            getDayItemColor,
            getFont,
        }
    }
})
</script>