<template>
    <div class="w-full h-full flex flex-col ltr:border-r rtl:border-l border-l-outline-variant">
        <div v-for="hour in hoursList" :key="hour.raw" :style="{ height: itemHeights }"
            class="flex items-center text-center justify-center px-3  text-label-md text-on-surface/50 border-b min-h-20 border-b-outline-variant select-none">
            {{ hour.label }}
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, type PropType, computed } from 'vue';
import { useI18n } from '#imports';
import type { CalendarTimeRange } from '~/types/components/calendar';

export default defineComponent({
    name: 'CalendarSideItem',
    props: {
        range: {
            type: Object as PropType<CalendarTimeRange>,
            required: true,
        }
    },
    setup(props) {
        const { t } = useI18n();

        const numFormat = new Intl.NumberFormat('fa-IR');
        const itemHeights = computed(() => `${100 / (hoursList.value.length)}%`)

        const hoursList = computed(() => {
            const list = [];
            const { start, end } = props.range;

            for (let h = start; h <= end; h++) {
                let suffixKey = '';
                if (h >= 1 && h <= 11) {
                    suffixKey = 'morning';
                } else if (h === 12) {
                    suffixKey = 'noon';
                } else if (h >= 13 && h < 19) {
                    suffixKey = 'afternoon';
                } else {
                    suffixKey = 'night';
                }
                let displayHour = h;
                if (h > 12) displayHour = h - 12;
                if (h === 0) displayHour = 12;

                list.push({
                    raw: h,
                    label: `${numFormat.format(displayHour)} ${t(`calendar.dayTimes.${suffixKey}`)}`
                });
            }
            return list;
        });

        return {
            hoursList,
            itemHeights,
        }
    }
})
</script>