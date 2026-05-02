<template>
    <div class="flex items-center justify-center rounded-full shrink-0 select-none cursor-pointer transition-transform duration-150 ease-out"
        :class="[
            story.isRead ? 'border-outline/40' : 'border-primary story-pulse',
            sizeClasses.wrapper,
            isPressed ? 'scale-90' : 'scale-100'
        ]" @mousedown="isPressed = true" @mouseup="isPressed = false" @mouseleave="isPressed = false"
        @touchstart="isPressed = true" @touchend="isPressed = false" @click="handleStoryClick">
        <!-- The inner white/surface ring to separate the image from the colorful border -->
        <div class="overflow-hidden rounded-full border-surface" :class="sizeClasses.inner">
            <div class=" bg-diamond-surface rounded-full overflow-hidden w-full aspect-square">
                <BImage :src="story.thumbnail"
                    class="min-w-full min-h-full max-w-full max-h-full h-full w-full object-cover" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, type PropType, ref, computed } from 'vue';
import type { Story } from '~/types/story';
import { useEventBus } from '@vueuse/core';
export default defineComponent({
    name: 'StoryDisplay',
    props: {
        story: {
            type: Object as PropType<Story>,
            required: true,
        },
        size: {
            type: String as PropType<'sm' | 'md' | 'lg'>,
            default: 'md'
        },
        canOpen: {
            type: Boolean,
            default: true
        }
    },
    setup(props) {
        const isPressed = ref(false);
        const storyBus = useEventBus<number>('open-story');

        const sizeClasses = computed(() => {
            if (props.size === 'sm') {
                return { wrapper: 'w-6 h-6 border-2', inner: 'w-full h-full border-[1.5px]' };
            } else if (props.size === 'lg') {
                return { wrapper: 'w-[60px] h-[60px] border-[2px]', inner: 'w-full h-full border-2' };
            } else {
                return { wrapper: 'w-[52px] h-[52px] border-[2px]', inner: 'w-full h-full border-2' };
            }
        });

        const handleStoryClick = () => {
            if (props.canOpen) {
                storyBus.emit(props.story.id); 
            }
        };
        return {
            isPressed,
            sizeClasses,
            handleStoryClick,
        };
    }
})
</script>

<style scoped>
/* Keeping only the color pulse in CSS, everything else is Tailwind */
.story-pulse {
    animation: pulse-border 2s infinite;
}

@keyframes pulse-border {

    0%,
    100% {
        border-color: var(--color-primary-500);
    }

    50% {
        border-color: var(--color-primary-300);
    }
}
</style>