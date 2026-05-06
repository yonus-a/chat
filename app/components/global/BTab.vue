<template>
    <div v-if="mode === 'outline'" class="flex flex-col gap-y-2">
        <div class="flex items-center gap-x-5 select-none text-label-md relative">
            <div v-for="(tab, index) in tabs" :key="index" ref="tabRefs" @click="setTab(index)"
                class="cursor-pointer transition-colors duration-200 py-1"
                :class="[modelValue === index ? 'text-on-surface' : 'text-on-surface/50']">
                {{ tab }}
            </div>
        </div>

        <div class="w-full relative h-0.5 rounded-full bg-outline-variant">
            <div class="absolute bottom-0 h-full bg-gradient-primary-secondary rounded-full transition-all duration-200 ease-in-out"
                :style="indicatorStyle"></div>
        </div>
    </div>
    <div v-else-if="mode === 'fill'"
        class=" bg-surface relative border rounded-xl border-outline p-1 flex items-center">
        <div v-for="(tab, index) in tabs" :key="index" ref="tabRefs" @click="setTab(index)"
            class="flex items-center justify-center select-none relative z-10 cursor-pointer py-0.5 px-2.5 transition-all duration-200 ease-in-out">
            <div class="text-label-md transition-all duration-200 ease-in-out"
                :class="[modelValue == index ? 'text-surface' : 'text-on-surface/50']">
                {{ tab }}
            </div>
        </div>
        <div class="absolute z-0 bg-diamond-black dark:bg-diamond-surface rounded-lg top-1 bottom-1 transition-all duration-200 ease-in-out"
            :style="indicatorStyle"></div>
    </div>
</template>

<script lang="ts">
import { defineComponent, type PropType, ref, watch, onMounted, nextTick, onBeforeUnmount } from 'vue';

export default defineComponent({
    name: 'TheTab',
    props: {
        modelValue: {
            type: Number,
            default: 0
        },
        tabs: {
            type: Array as PropType<string[]>,
            default: () => []
        },
        mode: {
            type: String as PropType<'outline' | 'fill'>,
            default: 'outline'
        }
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
        const tabRefs = ref<HTMLElement[]>([]);
        const indicatorStyle = ref({
            width: '0px',
            left: '0px'
        });

        const updateIndicator = () => {
            const activeEl = tabRefs.value[props.modelValue];
            if (activeEl) {
                // Using offsetLeft and offsetWidth for the most reliable tab tracking
                const width = activeEl.offsetWidth;
                const left = activeEl.offsetLeft;

                indicatorStyle.value = {
                    width: `${width}px`,
                    left: `${left}px`
                };
            }
        };

        const setTab = (index: number) => {
            emit('update:modelValue', index);
        };

        // Watch for tab changes
        watch(() => props.modelValue, () => {
            nextTick(() => {
                updateIndicator();
            });
        });

        // Initial setup
        onMounted(() => {
            // We use two checks to ensure fonts and layout engine have painted
            nextTick(() => {
                updateIndicator();
            });

            // Fallback for slower layouts or SSR hydration
            setTimeout(updateIndicator, 100);

            window.addEventListener('resize', updateIndicator);
        });

        onBeforeUnmount(() => {
            window.removeEventListener('resize', updateIndicator);
        });

        return {
            setTab,
            tabRefs,
            indicatorStyle
        };
    }
})
</script>

<style scoped>
.bg-gradient-primary-secondary {
    /* Ensure the gradient has high visibility */
    min-height: 2px;
    z-index: 10;
}

.transition-all {
    will-change: left, width;
}
</style>