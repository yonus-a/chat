<template>
    <div @click="toggleCheck" class="group inline-flex items-center transition-all duration-200"
        :class="{ 'gap-x-3': hasContent, 'cursor-pointer': !disabled, 'opacity-50 cursor-not-allowed': disabled }">
        <div class="shrink-0 flex items-center justify-center">

            <div v-if="mode === 'checkbox'"
                class="w-5 h-5 p-0.5 relative rounded-md flex justify-center items-center overflow-hidden  transition-all duration-200"
                :class="[color === 'error' ? 'bg-error' : 'bg-outline']">
                <div class="absolute inset-0 transition-opacity duration-200 ease-in-out"
                    :class="[activeBackgroundClass, isActive ? 'opacity-100' : 'opacity-0']">
                </div>
                <div
                    class="z-10 w-full h-full bg-surface relative rounded-[3px] overflow-hidden flex justify-center items-center">
                    <div class="absolute inset-0 transition-all duration-200 flex justify-center items-center ease-in-out"
                        :class="[activeBackgroundClass, isActive ? 'scale-100 opacity-100' : 'scale-0 opacity-0']">
                        <BIcon class="w-3.5 h-3.5 fill-white" weight="bold" :icon="activeIcon" />
                    </div>
                </div>
            </div>

            <div v-else-if="mode === 'radio'"
                class="w-5 h-5 relative rounded-full flex justify-center items-center overflow-hidden bg-outline transition-all duration-200">
                <div class="absolute inset-0 transition-opacity duration-200 ease-in-out"
                    :class="[activeBackgroundClass, isActive ? 'opacity-100' : 'opacity-0']"></div>
                <div class="z-10 bg-surface rounded-full transition-all duration-200 ease-in-out"
                    :class="isActive ? 'w-2.5 h-2.5' : 'w-4 h-4'"></div>
            </div>

            <div v-else-if="mode === 'switch'" :dir="dir"
                class="h-5 w-9 p-1 relative rounded-full flex items-center bg-outline overflow-hidden transition-all duration-200">
                <div class="absolute inset-0 transition-opacity duration-200 ease-in-out"
                    :class="[activeBackgroundClass, isActive ? 'opacity-100' : 'opacity-0']"></div>
                <div class="z-10 w-3 h-3 bg-surface rounded-full transition-transform duration-200 ease-in-out"
                    :style="{ transform: switchTransform }"></div>
            </div>
        </div>

        <div v-if="hasContent" class="select-none flex-1">
            <slot>
                <span class="text-body-md text-on-surface">{{ label }}</span>
            </slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, useSlots } from 'vue';
import { useLocale } from '#imports';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
        required: true,
    },
    mode: {
        type: String as () => 'checkbox' | 'radio' | 'switch',
        default: 'checkbox'
    },
    label: {
        type: String,
        default: ''
    },
    color: {
        type: String as () => 'primary' | 'error',
        default: 'primary'
    },
    disabled: {
        type: Boolean,
        default: false,
    }
});

const emit = defineEmits(['update:modelValue']);
const slots = useSlots();
const { dir } = useLocale();

const isActive = ref(props.modelValue);

watch(() => props.modelValue, (newVal) => {
    isActive.value = newVal;
});

const toggleCheck = () => {
    if (props.disabled) return
    emit('update:modelValue', !isActive.value);
};

const hasContent = computed(() => !!props.label || !!slots.default);

const switchTransform = computed(() => {
    if (!isActive.value) return 'translateX(0)';
    return dir.value === 'rtl' ? 'translateX(-16px)' : 'translateX(16px)';
});

// New logic for color states
const activeBackgroundClass = computed(() => {
    return props.color === 'error' ? 'bg-error' : 'bg-diamond-primary-secondary';
});

const activeIcon = computed(() => {
    return props.color === 'error' ? 'PhX' : 'PhCheck';
});
</script>

<style scoped>
.border-gradient-diamond {
    position: relative;
    border: none !important;
}

.border-gradient-diamond::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 2px;
    background: var(--background-image-diamond-primary-secondary);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
}
</style>