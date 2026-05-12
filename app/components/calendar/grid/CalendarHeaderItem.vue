<template>
    <div class=" w-full items-stretch flex justify-between">
        <div :style="{ width: itemWidths }" v-if="mode !== 'monthly'"
            class="border min-w-9 max-w-9 md:max-w-25 border-outline-variant">
        </div>
        <div class=" border-y rtl:border-l ltr:border-r border-outline-variant py-4 flex-col flex-1 gap-y-2.5 flex items-center justify-center"
            v-for="day in days" :key="day.name" :style="{ minWidth: itemWidths }">
            <CalendarDayBadge  v-if="mode !== 'monthly'" :day="day" />
            <div class=" select-none text-on-surface/50 text-body-sm text-[10px] md:text-label-md">{{ day.name }}</div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, type PropType, computed } from 'vue';
import type { CalendarDay, CalendarMode } from '~/types/components/calendar';
import CalendarDayBadge from './CalendarDayBadge.vue';


export default defineComponent({
    name: 'CalendarHeaderItem',
    components: {
        CalendarDayBadge,
    },
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


        const itemWidths = computed(() => {
            const totalSlots = props.days.length + (props.mode === 'monthly' ? 0 : 1);
            return `${100 / totalSlots}%`;
        });


        return {
            itemWidths,
        }
    }
})
</script>
<style scoped>
.english-num {
    font-family: "IranYekan" sans-serif !important;
}
</style>