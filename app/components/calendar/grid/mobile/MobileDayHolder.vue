<template>
    <div @click="selectDay" 
         class="flex flex-col items-center justify-start gap-y-0.5 w-full overflow-hidden"
         :class="[
            canSelect ? 'cursor-pointer' : 'cursor-default', 
            isDragging ? '' : 'transition-all duration-300 ease-out'
         ]"
         :style="{ height: `${40 + (expandProgress * 16)}px` }">
        
        <div class="relative w-8 h-8 shrink-0 rounded-full transition-all duration-200 ease-in-out aspect-square border"
            :class="styles.border">
            <div class="rounded-full w-full h-full transition-all duration-200 ease-in-out bg-diamond-black dark:bg-diamond-gray"
                :class="styles.bg"></div>
            <div class="w-full h-full absolute inset-0 left-0 top-0 flex items-center justify-center">
                <div class="select-none text-label-md transition-all duration-200 ease-in-out"
                    :class="styles.text">{{ day.primary }}</div>
            </div>
        </div>

        <div class="w-full flex-1 relative flex justify-center">
            
            <div class="rounded-full aspect-square w-1.5 bg-error absolute " 
                 v-if="canSelect"
                 :class="[isDragging ? '' : 'transition-all duration-300 ease-out']"
                 :style="{ 
                    opacity: Math.max(0, 1 - (expandProgress * 2)), 
                    transform: `scale(${Math.max(0, 1 - (expandProgress * 2))})` 
                 }">
            </div>

            <div class="w-full flex flex-col gap-y-px absolute top-0 px-0.5"
                 v-if="canSelect"
                 :class="[isDragging ? '' : 'transition-all duration-300 ease-out']"
                 :style="{ 
                    opacity: expandProgress, 
                    transform: `translateY(${(1 - expandProgress) * 6}px)` 
                 }">
                <div v-for="event in displayedEvents" :key="event.id" 
                     class="w-full rounded-full shrink-0 min-h-1"
                    :style="{ backgroundColor: event.color }"></div>
            </div>
            
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue';
import type { CalendarDay } from '~/types/components/calendar';
import type { CalendarEventPayload } from '~/types/calendar';

export default defineComponent({
    name: 'MobileDayHolder',
    props: {
        day: {
            type: Object as PropType<CalendarDay>,
            required: true,
        },
        isSelected: {
            type: Boolean,
            default: false,
        },
        events: {
            type: Array as PropType<CalendarEventPayload[]>,
            default: () => []
        },
        // Receives the drag amount from the grid
        expandProgress: {
            type: Number,
            default: 0
        },
        // Tells the component to stop CSS transitions so it sticks to the user's finger
        isDragging: {
            type: Boolean,
            default: false
        }
    },
    emits: ['select'],
    setup(props, { emit }) {
        const canSelect = computed(() => props.events.length > 0)
        const displayedEvents = computed(() => props.events.slice(0, 4));

        const selectDay = () => {
            if (canSelect.value) {
                emit('select', props.day)
            }
        }

        // Cleaned up styling logic per your request
        const styles = computed(() => {
            if (props.isSelected) {
                return { border: 'border-transparent', bg: 'opacity-100', text: 'text-on-primary' };
            }
            if (props.day.isToday) {
                return { border: 'border-primary', bg: 'opacity-0', text: 'text-primary' };
            }
            return { border: 'border-transparent', bg: 'opacity-0', text: 'text-on-surface/50' };
        });

        return {
            canSelect,
            displayedEvents,
            selectDay,
            styles
        }
    }
})
</script>