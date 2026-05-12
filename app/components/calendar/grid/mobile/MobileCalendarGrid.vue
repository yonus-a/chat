<template>
    <div class="w-full pt-6 px-4" style="touch-action: pan-x;"
         @touchstart="handleTouchStart"
         @touchmove="handleTouchMove"
         @touchend="handleTouchEnd">
         
        <div class="select-none text-[10px] text-on-surface/50 w-full flex items-center justify-between">
            <div class="aspect-square w-8 shrink-0 flex items-center justify-center" v-for="day in weekDays"
                :key="day.dayOfWeek">
                <div>{{ day.fullName }}</div>
            </div>
        </div>
        
        <div class="w-full mt-4 grid grid-cols-7 gap-x-5 gap-y-4">
            <div v-for="(day, index) in days" :key="index" :class="[
                'transition-opacity duration-200',
                isOtherMonthFunc(day.date) ? 'opacity-0 pointer-events-none' : 'opacity-100'
            ]">
                <MobileDayHolder 
                    :is-selected="isDaySelected(day)" 
                    :expand-progress="progress"
                    :is-dragging="isDragging"
                    @select="selectDay" 
                    :day="day"
                    :events="eventsByDay.get(new Date(day.date).toDateString()) || []" 
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted, type PropType } from 'vue';
import { useCalendarDate } from '~/composables/calendar/useCalendarDate';
import type { CalendarEventPayload } from '~/types/calendar';
import type { CalendarDay, CalendarMode } from '~/types/components/calendar';
import MobileDayHolder from './MobileDayHolder.vue';

export default defineComponent({
    name: 'MobileCalendarGrid',
    components: {
        MobileDayHolder,
    },
    props: {
        days: {
            type: Array as PropType<CalendarDay[]>,
            default: () => []
        },
        eventsByDay: {
            type: Object as PropType<Map<string, CalendarEventPayload[]>>,
            required: true
        },
        isOtherMonthFunc: {
            type: Function as PropType<(date: Date) => boolean>,
            required: true
        },
        mode: {
            type: String as PropType<CalendarMode>,
            required: true,
        }
    },
    setup() {
        const { getWeekDayNames } = useCalendarDate()
        const weekDays = computed(() => getWeekDayNames.value);

        const selectedDate = ref('');

        const selectDay = (day: CalendarDay) => {
            selectedDate.value = new Date(day.date).toDateString();
        };

        onMounted(() => {
            const today = new Date().toDateString();
            selectedDate.value = today;
        });

        const isDaySelected = (day: CalendarDay) => {
            return selectedDate.value === new Date(day.date).toDateString()
        }

        // --- SWIPE TO EXPAND LOGIC ---
        const progress = ref(0); // 0.0 (collapsed) to 1.0 (expanded)
        const isDragging = ref(false);
        
        let startY = 0;
        let startProgress = 0;
        const maxDragDistance = 120; // Pixels needed to fully expand

        const handleTouchStart = (e: TouchEvent) => {
            startY = e.touches[0].clientY;
            startProgress = progress.value;
            isDragging.value = true;
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!isDragging.value) return;
            const deltaY = e.touches[0].clientY - startY;
            
            // Calculate new progress and clamp strictly between 0 and 1
            let newProgress = startProgress + (deltaY / maxDragDistance);
            progress.value = Math.max(0, Math.min(1, newProgress));
        };

        const handleTouchEnd = () => {
            isDragging.value = false;
            
            // Snap Threshold Logic (25% threshold to snap to the other state)
            if (progress.value > 0.25 && startProgress === 0) {
                progress.value = 1; // Snap Open
            } else if (progress.value < 0.75 && startProgress === 1) {
                progress.value = 0; // Snap Closed
            } else {
                // If they didn't pass the threshold, snap back to where they started
                progress.value = startProgress; 
            }
        };

        return {
            isDaySelected,
            weekDays,
            selectDay,
            selectedDate,
            progress,
            isDragging,
            handleTouchStart,
            handleTouchMove,
            handleTouchEnd
        }
    }
})
</script>