<template>
    <div dir="ltr" class=" relative cursor-pointer">
        <svg :width="finalWidth" :height="finalHeight" viewBox="0 0 65 72" fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd"
                d="M47.564 4.21766C44.8552 1.51714 41.1812 0 37.3502 0H14.4444C6.467 0 0 6.4471 0 14.4V57.6C0 65.5529 6.467 72 14.4444 72H50.5556C58.533 72 65 65.5529 65 57.6V27.5647C65 23.7456 63.4782 20.0829 60.7693 17.3823L47.564 4.21766Z"
                :fill="mainColor" />

            <path fill-rule="evenodd" clip-rule="evenodd"
                d="M44 1C45.5315 1.7318 46.9413 2.75075 48.154 4.02411L61.1199 17.6383C61.1203 17.6387 61.1207 17.6392 61.1211 17.6396C62.3333 18.9127 63.3033 20.3924 64 22H52.8641C47.9686 22 44 17.833 44 12.6927V1Z"
                :fill="accentColor" />
        </svg>
        <div class=" absolute right-0 top-1/2 rounded-sm px-1 py-0.5 flex items-center justify-center "
            :style="{ backgroundColor: accentColor }">
            <div class="text-center text-white text-[7px] font-bold leading-none uppercase tracking-wide">{{ label }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
    width: { type: [Number, String], default: 40 },
    height: { type: [Number, String], default: 40 },
    label: { type: String, default: '' },
    // Colors
    mainColor: { type: String, default: '#FFFFFF' },
    accentColor: { type: String, default: '#F24E1E' },
    labelColor: { type: String, default: '#333333' }
});

const ASPECT_RATIO = 65 / 72;

const finalWidth = computed(() => {
    if (props.width) return props.width;
    if (props.height) return Number(props.height) * ASPECT_RATIO;
    return 65; // Fallback to original
});

const finalHeight = computed(() => {
    if (props.height) return props.height;
    if (props.width) return Number(props.width) / ASPECT_RATIO;
    return 72; // Fallback to original
});
</script>