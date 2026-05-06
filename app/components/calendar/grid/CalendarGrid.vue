<template>
    <div class="w-full h-full max-h-full flex flex-col">
        <CalendarHeaderItem class="shrink-0" :mode="mode" :days="displayedHeader" />
        <div class="w-full flex-1 min-h-0 overflow-hidden">
            <div class="h-full w-full overflow-y-auto hide-scrollbar">
                <div class="flex items-stretch min-h-full w-full">
                    <div v-if="mode !== 'monthly'" class="shrink-0 basis-25">
                        <CalendarSideItem :range="hours" />
                    </div>

                    <!-- Main Grid: items-stretch makes this match the Sidebar height exactly -->
                    <div class=" flex-1 relative">
                        <div class=" w-full h-full" v-if="mode !== 'monthly'">
                            <!-- Grid displays-->
                            <div
                                class=" w-full absolute top-0 left-0 h-full pointer-events-none justify-between flex items-stretch">
                                <div class=" h-full  border-surface-variant"
                                    :class="[n === headers.length + 1 || n === 1 ? ' border-0' : 'border']"
                                    v-for="n in headers.length + 1" :key="n">
                                </div>
                            </div>
                            <div
                                class=" w-full absolute top-0 left-0 h-full flex-col pointer-events-none justify-between flex items-stretch">
                                <div class=" w-full border border-surface-variant"
                                    :class="[n === headers.length + 1 || n === 1 ? ' border-0' : 'border']"
                                    v-for="n in (hours.end - hours.start + 2)" :key="n">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, type PropType, watch } from 'vue';
import { useCalendarDate } from '~/composables/calendar/useCalendarDate';
import type { CalendarMode, CalendarDateRange, CalendarTimeRange } from '~/types/components/calendar';
import CalendarHeaderItem from './CalendarHeaderItem.vue';
import CalendarSideItem from './CalendarSideItem.vue';
export default defineComponent({
    name: 'CalendarGrid',
    components: {
        CalendarHeaderItem,
        CalendarSideItem,
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
            default: { start: 0, end: 24 }
        }
    },
    setup(props) {
        const { getCalendarHeaders } = useCalendarDate();
        const columnWidths = computed(() => `${100 / (headers.value.length + (props.mode == 'monthly' ? 0 : 1))}%`)

        const headers = computed(() => {
            return getCalendarHeaders(props.range, props.mode);
        });

        const displayedHeader = computed(() => {
            if (props.mode !== 'monthly') return headers.value
            return headers.value.slice(0, 7);
        })

        onMounted(() => {
            console.log('range applied', getCalendarHeaders(props.range, 'monthly'))
            console.log(headers.value)
        })

        watch(() => headers.value, () => {
            console.log(headers.value)
        }, { deep: true, immediate: true })

        return {
            headers,
            columnWidths,
            displayedHeader,
        }
    }
})
</script>