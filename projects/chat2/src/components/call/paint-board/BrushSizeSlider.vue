<template>
    <div dir="ltr" ref="sliderRef"
        class="relative w-12 h-44 bg-surface rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.1)] flex justify-center touch-none select-none overflow-visible cursor-pointer"
        @pointerdown.stop.prevent="startDrag">

        <!-- Tapered Track (Thin at top, thick at bottom) -->
        <div class="absolute inset-y-4 inset-x-0 flex justify-center pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 48 144" preserveAspectRatio="none">
                <path d="M22,0 L26,0 L34,134 A 10 10 0 0 1 14,134 Z"  class=" fill-surface-variant" />
            </svg>
        </div>

        <!-- Dynamic Handle (Scales with value) -->
        <div class="absolute left-1/2 rounded-full pointer-events-none transition-none shadow-sm" :style="{
            top: `calc(${thumbPositionPercent}% + 1rem - ${thumbPositionPercent * 0.32}px)`,
            width: `${handleSize}px`,
            height: `${handleSize}px`,
            backgroundColor: color,
            transform: `translate(-50%, -50%)`
        }">
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onBeforeUnmount } from 'vue';

export default defineComponent({
    name: 'BrushSizeSlider',
    props: {
        modelValue: { type: Number, required: true },
        min: { type: Number, default: 1 },
        max: { type: Number, default: 20 },
        color: { type: String, default: '#000000' }
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
        const sliderRef = ref<HTMLElement | null>(null);

        // Top is MIN (thinnest), Bottom is MAX (thickest)
        const thumbPositionPercent = computed(() => {
            const range = props.max - props.min;
            const val = props.modelValue - props.min;
            return (val / range) * 100; // 0% at top, 100% at bottom
        });

        // Handle grows dynamically (e.g., from 6px to 22px)
        const handleSize = computed(() => {
            const range = props.max - props.min;
            const val = props.modelValue - props.min;
            return 6 + (val / range) * 16;
        });

        const updateValueFromEvent = (e: PointerEvent) => {
            if (!sliderRef.value) return;
            const rect = sliderRef.value.getBoundingClientRect();
            const padding = 16; // 1rem padding top and bottom
            const trackHeight = rect.height - (padding * 2);

            let y = e.clientY - rect.top - padding;
            y = Math.max(0, Math.min(y, trackHeight));

            const percent = y / trackHeight;
            const range = props.max - props.min;
            const newValue = Math.round(props.min + (percent * range));

            emit('update:modelValue', newValue);
        };

        const onPointerMove = (e: PointerEvent) => updateValueFromEvent(e);
        const onPointerUp = () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };

        const startDrag = (e: PointerEvent) => {
            updateValueFromEvent(e);
            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('pointerup', onPointerUp);
        };

        onBeforeUnmount(() => onPointerUp());

        return { sliderRef, thumbPositionPercent, handleSize, startDrag };
    }
});
</script>