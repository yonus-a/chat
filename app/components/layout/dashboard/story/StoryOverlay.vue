<template>
    <Teleport to="body">
        <div class="fixed top-0 left-0 w-dvw h-dvh z-100 transition-all duration-200 flex items-center justify-center ease-in-out"
            :class="[isOpen ? ' bg-on-surface/10 backdrop-blur-lg' : ' bg-on-surface/0 pointer-events-none backdrop-blur-none']"
            @click.self="closeStory" @contextmenu.prevent>

            <div class="sm:gap-x-6 h-full sm:h-164 flex items-center">
                <div @click="prevStory"
                    :class="[isOpen ? 'scale-100 pointer-events-auto opacity-100' : 'scale-0 opacity-0 pointer-events-none']"
                    class="rounded-full aspect-square h-11 hidden sm:flex items-center justify-center cursor-pointer bg-surface transition-all duration-200 ease-in-out">
                    <BIcon icon="PhCaretLeft" class="w-6 rtl:rotate-180 ltr:rotate-0 h-6 fill-on-surface" />
                </div>

                <div class="relative w-dvw sm:w-94 h-full sm:rounded-2xl bg-diamond-black dark:bg-diamond-gray overflow-hidden transition-all duration-200 ease-in-out"
                    :class="[isOpen ? 'scale-100 opacity-100' : 'scale-75 opacity-0 pointer-events-none']"
                    @mousedown="!isMobile ? null : handlePressStart()" @mouseup="!isMobile ? null : handlePressEnd()"
                    @mouseleave="!isMobile ? null : handlePressEnd()" @touchstart="handlePressStart"
                    @touchend="handlePressEnd" @click="handleDesktopClick">

                    <div
                        class="flex flex-col gap-y-1 w-full py-3 px-2 absolute top-0 z-50 ">
                        <div class="w-full flex gap-x-1 items-center">
                            <div v-for="(story, index) in stories" :key="story.id"
                                :style="{ width: `${100 / stories.length}%` }"
                                class="bg-white/20 rounded-full h-1 relative overflow-hidden">
                                <div class="absolute inset-0 bg-white rounded-full transition-none"
                                    :style="{ width: getProgressWidth(index) + '%' }"></div>
                            </div>
                        </div>
                        <div class="flex justify-end w-full px-1 pt-1">
                            <BIcon class="cursor-pointer w-6 h-6 fill-white drop-shadow-md" @click="closeStory"
                                icon="PhX" />
                        </div>
                    </div>

                    <!-- ISOLATED MEDIA COMPONENTS -->
                    <template v-if="currentStory && isOpen">
                        <StoryImageDisplay v-if="currentStory.type === 'image'" :story="currentStory"
                            @ready="onMediaReady" />
                        <StoryVideoDisplay v-else-if="currentStory.type === 'video'" :story="currentStory"
                            :isPaused="isPaused" @ready="onMediaReady" @metadata="onVideoMetadata" @ended="nextStory" />
                    </template>

                    <div class="absolute inset-0 flex z-30 sm:hidden">
                        <div class="w-[35%] h-full" @click="prevStory"></div>
                        <div class="flex-1 h-full"></div>
                        <div class="w-[35%] h-full" @click="nextStory"></div>
                    </div>
                </div>

                <div @click="nextStory"
                    :class="[isOpen ? 'scale-100 pointer-events-auto opacity-100' : 'scale-0 opacity-0 pointer-events-none']"
                    class="rounded-full aspect-square h-11 hidden sm:flex items-center justify-center cursor-pointer bg-surface transition-all duration-200 ease-in-out">
                    <BIcon icon="PhCaretRight" class="w-6 rtl:rotate-180 ltr:rotate-0 h-6 fill-on-surface" />
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script lang="ts">
import { ref, defineComponent, computed, onMounted, onUnmounted } from 'vue';
import type { Story } from '~/types/story';
import { useStoriesStore, useWindowSize } from '#imports';
import { useEventBus } from '@vueuse/core';

// EXPLICIT IMPORTS TO FIX THE BLANK RENDER (Adjust path if they aren't in the same folder)
import StoryImageDisplay from './StoryImageDisplay.vue';
import StoryVideoDisplay from './StoryVideoDisplay.vue';

export interface StoryOverlayExposed {
    openStory: (id: number) => void;
    closeStory: () => void;
}

export default defineComponent({
    name: 'StoryOverlay',
    components: { StoryImageDisplay, StoryVideoDisplay },
    setup(_, { expose }) {
        const storiesStore = useStoriesStore();

        const activeIndex = ref(0);
        const progress = ref(0);
        const isPaused = ref(false);
        const currentDuration = ref(15000);
        const isOpen = ref(false);

        const { width } = useWindowSize();
        const isMobile = computed(() => width.value < 640);
        const stories = computed<Story[]>(() => storiesStore.stories);
        const currentStory = computed<Story | undefined>(() => stories.value[activeIndex.value]);

        const storyBus = useEventBus<number>('open-story');
        storyBus.on((id) => openStory(id));

        let animationFrame: number;
        let lastTimestamp: number;

        const nextStory = () => {
            if (activeIndex.value < stories.value.length - 1) {
                activeIndex.value++;
                resetStoryState();
            } else {
                closeStory();
            }
        };

        const prevStory = () => {
            if (activeIndex.value > 0) {
                activeIndex.value--;
                resetStoryState();
            }
        };

        const resetStoryState = () => {
            progress.value = 0;
            isPaused.value = false;
            lastTimestamp = 0;
            if (currentStory.value?.type === 'image') {
                currentDuration.value = 15000;
            }
        };

        const getProgressWidth = (index: number) => {
            if (index < activeIndex.value) return 100;
            if (index > activeIndex.value) return 0;
            return progress.value;
        };

        const handleDesktopClick = () => {
            if (isMobile.value) return;
            isPaused.value = !isPaused.value;
        };

        const handlePressStart = () => {
            if (!isMobile.value) return;
            isPaused.value = true;
        };

        const handlePressEnd = () => {
            if (!isMobile.value) return;
            isPaused.value = false;
        };

        // Triggered by child components instantly if preloaded, or after buffering
        const onMediaReady = () => {
            if (currentStory.value) {
                storiesStore.markAsRead(currentStory.value.id);
            }
        };

        const onVideoMetadata = (duration: number) => {
            currentDuration.value = duration;
        };

        const tick = (timestamp: number) => {
            if (!lastTimestamp) lastTimestamp = timestamp;
            const deltaTime = timestamp - lastTimestamp;
            lastTimestamp = timestamp;

            if (!isPaused.value && isOpen.value) {
                progress.value += (deltaTime / currentDuration.value) * 100;
                if (progress.value >= 100) nextStory();
            }
            animationFrame = requestAnimationFrame(tick);
        };

        const openStory = (id: number) => {
            const index = stories.value.findIndex(s => s.id === id);
            if (index !== -1) {
                activeIndex.value = index;
                isOpen.value = true;
                resetStoryState();
            }
        };

        const closeStory = () => {
            isOpen.value = false;
            isPaused.value = true;
        };

        onMounted(() => animationFrame = requestAnimationFrame(tick));
        onUnmounted(() => cancelAnimationFrame(animationFrame));

        expose({ closeStory, openStory } as StoryOverlayExposed);

        return {
            storiesStore, closeStory, nextStory, prevStory, stories, isOpen, activeIndex, currentStory,
            progress, isPaused, getProgressWidth, onMediaReady, onVideoMetadata,
            handlePressStart, handlePressEnd, isMobile, handleDesktopClick
        }
    }
})
</script>

<style scoped>
.transition-none {
    transition: none !important;
}
</style>