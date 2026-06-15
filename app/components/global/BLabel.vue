<template>
    <div>
        <div @click="emit('click')" :class="[
            'relative inline-flex  items-center justify-center select-none rounded-full transition-all duration-200 ease-in-out',
            sizeClasses,
            colorClasses,
            paddingClasses,
            icon.trim().length == 0 ? 'gap-x-0' : 'gap-x-1',
            { 'border-gradient-active': type === 'bold' || (type === 'outline' && hasGradient) }
        ]" :style="styleOverrides">

            <Transition name="icon-expand">
                <div v-if="icon"
                    :class="['shrink-0 z-10 flex items-center justify-center overflow-hidden', iconSizeClass, { 'rtl:ml-0 ltr:mr-0': !text }]"
                    :style="{ order: isRtl ? 2 : 1 }">
                    <BIcon @click.stop="emit('action')" :icon="icon" class="w-full h-full" />
                </div>
            </Transition>

            <span v-if="text" :class="['z-10 truncate transition-all duration-200 ease-in-out', textSizeClass]"
                :style="{ order: isRtl ? 1 : 2, marginInlineStart: icon ? gapSize : '0' }">
                {{ text }}
            </span>

        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue';
import { useLocale } from '#imports';

const props = defineProps({
    size: {
        type: String as PropType<'sm' | 'md' | 'lg'>,
        default: 'md'
    },
    color: {
        type: String as PropType<'success' | 'primary' | 'error' | 'warning' | 'neutral' | 'info'>,
        default: 'primary'
    },
    type: {
        type: String as PropType<'bold' | 'ghost' | 'outline'>,
        default: 'bold'
    },
    icon: {
        type: String,
        default: ''
    },
    text: {
        type: String,
        default: ''
    }
});

const { dir } = useLocale();
const isRtl = computed(() => dir.value === 'rtl');

const emit = defineEmits(['click', 'action']);
// --- Sizing Logic ---
const sizeClasses = computed(() => {
    switch (props.size) {
        case 'sm': return 'h-[26px]';
        case 'md': return 'h-[28px]';
        case 'lg': return 'h-[32px]';
        default: return 'h-[28px]';
    }
});

// Used on the wrapper now to control the animated width
const iconSizeClass = computed(() => {
    switch (props.size) {
        case 'sm': return 'w-3 h-3'; // 16px
        case 'md': return 'w-4 h-4';
        case 'lg': return 'w-4.5 h-4.5'; // 20px
        default: return 'w-[18px] h-[18px]';
    }
});

const textSizeClass = computed(() => {
    if (props.size === 'lg') return 'text-label-md';
    return 'text-label-sm';
});

const gapSize = computed(() => {
    if (props.size === 'sm') return '4px';
    return '8px';
});

const paddingClasses = computed(() => {
    if (props.icon && props.text) {
        return 'ltr:pl-2 ltr:pr-3 rtl:pr-2 rtl:pl-3'; // 8px icon side, 12px text side
    }
    if (props.icon) return 'px-1.5'; // 8px both sides
    return 'px-3'; // 12px both sides (text only)
});

// --- Coloring & Type Logic ---
const hasGradient = computed(() => !['neutral', 'info'].includes(props.color));

const colorClasses = computed(() => {
    const isGhost = props.type === 'ghost';
    const isOutline = props.type === 'outline';

    // Static Non-Gradient Colors
    if (props.color === 'info') {
        return [
            'text-[#0167FF] border',
            isOutline ? 'bg-transparent border-[#B0D0FF]' : 'bg-[#E6F0FF] border-[#B0D0FF]'
        ];
    }
    if (props.color === 'neutral') {
        return [
            'text-on-surface-variant border',
            isOutline ? 'bg-transparent border-outline' : 'bg-surface-variant border-outline'
        ];
    }

    // Gradient-based colors (Primary, Success, Error, Warning)
    const baseTextClasses = {
        primary: 'text-primary',
        success: 'text-success',
        error: 'text-error',
        warning: 'text-warning'
    };

    const baseBgClasses = {
        primary: 'bg-primary/10',
        success: 'bg-success/10',
        error: 'bg-error/10',
        warning: 'bg-warning/10'
    };

    let classes = [baseTextClasses[props.color as keyof typeof baseTextClasses]];

    if (isOutline) {
        classes.push('bg-transparent');
    } else {
        classes.push(baseBgClasses[props.color as keyof typeof baseBgClasses]);
    }

    // For Ghost (Fill), we use a solid border matching the background
    if (isGhost) {
        classes.push('border border-current/20'); // Current color border for ghost
    }

    return classes;
});

const styleOverrides = computed(() => {
    if (!hasGradient.value || props.type === 'ghost') return {};

    const gradients: Record<string, string> = {
        primary: 'var(--background-image-diamond-primary-secondary)',
        success: 'var(--background-image-diamond-primary)',
        error: 'var(--background-image-diamond-error)',
        warning: 'var(--background-image-diamond-warning)'
    };

    return {
        '--label-gradient': gradients[props.color] || gradients.primary
    };
});

const iconClicked = () => {
    emit('action')
}
</script>

<style scoped>
/* Gradient Border Trick using Masking */
.border-gradient-active {
    position: relative;
    border: none !important;
}

.border-gradient-active::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 9999px;
    padding: 1px;
    background: var(--label-gradient);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
}

/* 3. Icon Animation Classes */
.icon-expand-enter-active,
.icon-expand-leave-active {
    /* Synchronize with the 200ms duration of the text span and container */
    transition: width 200ms ease-in-out, opacity 200ms ease-in-out, transform 200ms ease-in-out;
}

.icon-expand-enter-from,
.icon-expand-leave-to {
    /* Shrink the width to 0, fade out, and slightly scale down */
    width: 0 !important;
    opacity: 0;
    transform: scale(0.5);
}
</style>