<template>
    <div class=" w-full items-stretch flex justify-between">
        <div :style="{ width: itemWidths }" v-if="mode !== 'monthly'" class="border  max-w-25 border-outline-variant"></div>
        <div class=" border-y rtl:border-l ltr:border-r border-outline-variant py-4 flex-col flex-1 gap-y-2.5 flex items-center justify-center"
            v-for="day in days" :key="day.name" :style="{ minWidth: itemWidths }">
            <div v-if="mode !== 'monthly'" class=" flex flex-col  items-center">
                <div class=" w-9 h-9 select-none border flex flex-col justify-center items-center rounded-full"
                    :class="[getDayItemColor(day).fill, getDayItemColor(day).text]">
                    <div :class="[getFont('tertiary', day)]" class=" leading-2 text-[8px]">{{ day.tertiary }}</div>
                    <div :class="[getFont('primary', day)]" class=" leading-3.5 text-label-md">{{ day.primary }}</div>
                    <div :class="[getFont('secondary', day)]" class=" leading-2 text-[8px]">{{ day.secondary }}</div>
                </div>
            </div>
            <div class=" select-none text-on-surface/50 text-label-md">{{ day.name }}</div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, type PropType, computed } from 'vue';
import type { CalendarDay, CalendarMode } from '~/types/components/calendar';


export default defineComponent({
    name: 'CalendarHeaderItem',
    props: {
        days: {
            type: Array as PropType<CalendarDay[]>,
            default: () => [],
        },
        mode: {
            type: String as PropType<CalendarMode>,
            default: 'monthly'
        }
    },
    setup(props) {


        const itemWidths = computed(() => `${100 / (props.days.length + (props.mode == 'monthly' ? 0 : 1))}%`)
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

        const getFont = (key: 'primary' | 'secondary' | 'tertiary', day: CalendarDay) => {
            if (day.gregorian === day[key]) {
                return 'font-latin'
            }
        }

        return {
            getDayItemColor,
            itemWidths,
            getFont,
        }
    }
})
</script>
<style scoped>
.english-num {
    font-family: "IranYekan" sans-serif !important;
}
</style>