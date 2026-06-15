<template>
    <div
        ref="tooltipRef"
        class="relative inline-block w-max"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
        @click="toggleClick"
    >
        <!-- Trigger element -->
        <slot name="trigger" />

        <!-- Tooltip Body -->
        <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 scale-90"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-90"
        >
            <div
                v-show="isOpen"
                class="absolute z-50 p-[8px] rounded-lg select-none bg-on-surface text-surface text-body-sm whitespace-nowrap"
                :class="positionClasses"
            >
                <slot>{{ text }}</slot>

                <!-- Triangular Handle (4px) -->
                <div
                    class="absolute w-0 h-0"
                    :class="arrowClasses"
                ></div>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    text: { 
        type: String, 
        default: '' 
    },
    position: { 
        type: String as () => 'top' | 'bottom' | 'left' | 'right', 
        default: 'top' 
    },
    mode: { 
        type: String as () => 'hover' | 'click', 
        default: 'hover' 
    }
});

const isOpen = ref(false);
const tooltipRef = ref<HTMLElement | null>(null);
let hoverTimeout: ReturnType<typeof setTimeout>;

// --- Event Handlers ---

const onMouseEnter = () => {
    if (props.mode !== 'hover') return;
    clearTimeout(hoverTimeout);
    isOpen.value = true;
};

const onMouseLeave = () => {
    if (props.mode !== 'hover') return;
    hoverTimeout = setTimeout(() => {
        isOpen.value = false;
    }, 0); // slight delay prevents flickering when moving cursor
};

const toggleClick = () => {
    if (props.mode !== 'click') return;
    isOpen.value = !isOpen.value;
};

// Handle clicks outside to close the tooltip
const closeOnOutsideClick = (event: MouseEvent) => {
    if (props.mode === 'click' && isOpen.value && tooltipRef.value) {
        if (!tooltipRef.value.contains(event.target as Node)) {
            isOpen.value = false;
        }
    }
};

onMounted(() => {
    document.addEventListener('click', closeOnOutsideClick);
});

onUnmounted(() => {
    document.removeEventListener('click', closeOnOutsideClick);
});

// --- Dynamic Styling ---

// Base positioning, margin for the 4px arrow gap, and transform origin
const positionClasses = computed(() => {
    switch (props.position) {
        case 'top':
            return 'bottom-full left-1/2 -translate-x-1/2 mb-[4px] origin-bottom';
        case 'bottom':
            return 'top-full left-1/2 -translate-x-1/2 mt-[4px] origin-top';
        case 'left':
            return 'right-full top-1/2 -translate-y-1/2 mr-[4px] origin-right';
        case 'right':
            return 'left-full top-1/2 -translate-y-1/2 ml-[4px] origin-left';
        default:
            return 'bottom-full left-1/2 -translate-x-1/2 mb-[4px] origin-bottom';
    }
});

// Structural CSS borders to create a pure 4px triangle inheriting the background color
const arrowClasses = computed(() => {
    switch (props.position) {
        case 'top':
            return 'top-full left-1/2 -translate-x-1/2 border-t-[4px] border-x-[4px] border-b-0 border-solid border-t-on-surface border-x-transparent';
        case 'bottom':
            return 'bottom-full left-1/2 -translate-x-1/2 border-b-[4px] border-x-[4px] border-t-0 border-solid border-b-on-surface border-x-transparent';
        case 'left':
            return 'left-full top-1/2 -translate-y-1/2 border-l-[4px] border-y-[4px] border-r-0 border-solid border-l-on-surface border-y-transparent';
        case 'right':
            return 'right-full top-1/2 -translate-y-1/2 border-r-[4px] border-y-[4px] border-l-0 border-solid border-r-on-surface border-y-transparent';
        default:
            return 'top-full left-1/2 -translate-x-1/2 border-t-[4px] border-x-[4px] border-b-0 border-solid border-t-on-surface border-x-transparent';
    }
});
</script>