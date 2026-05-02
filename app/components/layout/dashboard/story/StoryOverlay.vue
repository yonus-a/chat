<template>
    <Teleport to="body">
        <!-- Root Container: Fixed LTR for consistent UI, @contextmenu.prevent for pause logic -->
        <div class="fixed top-0 left-0 w-dvw h-dvh z-100 transition-all duration-200 flex items-center justify-center ease-in-out"
            :class="[isOpen ? ' bg-on-surface/10 backdrop-blur-lg' : ' bg-on-surface/0 pointer-events-none backdrop-blur-none']"
            @click.self="closeStory" @contextmenu.prevent>

            <div class="sm:gap-x-6 h-full sm:h-164 flex items-center">

                <!-- PREV BUTTON (Right side for RTL flow) -->
                <div @click="prevStory"
                    :class="[isOpen ? 'scale-100 pointer-events-auto opacity-100' : 'scale-0 opacity-0 pointer-events-none']"
                    class="rounded-full aspect-square h-11 hidden sm:flex items-center justify-center cursor-pointer bg-surface transition-all duration-200 ease-in-out">
                    <BIcon icon="PhCaretLeft" class="w-6  rtl:rotate-180 ltr:rotate-0h-6 fill-on-surface" />
                </div>

                <!-- MAIN STORY CONTAINER -->
                <div class="relative w-dvw sm:w-94 h-full sm:rounded-2xl bg-diamond-black dark:bg-diamond-gray overflow-hidden transition-all duration-200 ease-in-out"
                    :class="[isOpen ? 'scale-100 opacity-100' : 'scale-75 opacity-0 pointer-events-none']"
                    @mousedown="!isMobile ? null : handlePressStart()" @mouseup="!isMobile ? null : handlePressEnd()"
                    @mouseleave="!isMobile ? null : handlePressEnd()" @touchstart="handlePressStart"
                    @touchend="handlePressEnd" @click="handleDesktopClick">

                    <!-- Header: Progress Bars & Close -->
                    <div
                        class="flex flex-col gap-y-1 w-full py-3 px-2 absolute top-0 z-50 bg-gradient-to-b from-black/60 to-transparent">
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

                    <!-- MEDIA DISPLAY -->
                    <div class="w-full h-full flex items-center justify-center pointer-events-none relative">
                        <template v-if="currentStory">
                            <!-- Image / Video Thumbnail Fallback -->
                            <BImage
                                v-if="currentStory.type === 'image' || (currentStory.type === 'video' && (!videoStarted || isPaused))"
                                :src="resolvedThumbnail" class="w-full h-full object-cover" @load="onImageLoad" />

                            <!-- Video Element -->
                            <video v-if="currentStory.type === 'video'" ref="videoRef"
                                :src="currentStory.localBlobUrl || currentStory.mediaUrl"
                                class="w-full h-full object-cover" playsinline @loadedmetadata="onVideoMetadata"
                                @playing="onVideoPlaying" @waiting="isVideoLoading = true"
                                @canplay="isVideoLoading = false" @ended="nextStory"></video>
                        </template>

                        <!-- Video Overlay: Loading Spinner & Desktop Play Icon -->
                        <div class="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
                            <div v-if="currentStory?.type === 'video' && isVideoLoading"
                                class="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin">
                            </div>
                            <div v-else-if="currentStory?.type === 'video' && isPaused" class="hidden md:block">
                                <BIcon icon="PhPlay" class="w-16 h-16 fill-white" />
                            </div>
                        </div>
                    </div>

                    <!-- MOBILE NAVIGATION ZONES (RTL Logic) -->
                    <div class="absolute inset-0 flex z-30 sm:hidden">
                        <div class="w-[35%] h-full" @click="prevStory"></div> <!-- Right 35% -->
                        <div class="flex-1 h-full"></div>
                        <div class="w-[35%] h-full" @click="nextStory"></div> <!-- Left 35% -->
                    </div>
                </div>

                <!-- NEXT BUTTON (Left side for RTL flow) -->
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
import { ref, defineComponent, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import type { Story } from '~/types/story';
import { useStoriesStore, useWindowSize } from '#imports';
import { useEventBus } from '@vueuse/core';

export interface StoryOverlayExposed {
    openStory: (id: number) => void;
    closeStory: () => void;
}

export default defineComponent({
    name: 'StoryOverlay',
    setup(_, { expose }) {
        const storiesStore = useStoriesStore();
        const videoRef = ref<HTMLVideoElement | null>(null);

        // State
        const activeIndex = ref(0);
        const progress = ref(0);
        const isPaused = ref(false);
        const currentDuration = ref(15000);
        const isOpen = ref(false);
        const videoStarted = ref(false);
        const isVideoLoading = ref(true);
        const generatedThumbnails = ref<Record<number, string>>({});

        const { width } = useWindowSize();
        const isMobile = computed(() => width.value < 640);
        const stories = computed<Story[]>(() => storiesStore.stories);
        const currentStory = computed<Story | undefined>(() => stories.value[activeIndex.value]);

        // Event Bus for Global Triggers
        const storyBus = useEventBus<number>('open-story');
        storyBus.on((id) => openStory(id));

        let animationFrame: number;
        let lastTimestamp: number;

        // Navigation
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
            videoStarted.value = false;
            isVideoLoading.value = currentStory.value?.type === 'video';

            if (currentStory.value?.type === 'image') {
                currentDuration.value = currentDuration.value || 15000;
            }

            nextTick(() => {
                if (currentStory.value?.type === 'video' && videoRef.value) {
                    videoRef.value.currentTime = 0;
                    videoRef.value.play().catch(() => isPaused.value = true);
                }
            });
        };

        // UI Helpers
        const resolvedThumbnail = computed(() => {
            if (!currentStory.value) return '';
            if (currentStory.value.type === 'image') return currentStory.value.mediaUrl;
            return currentStory.value.thumbnail || generatedThumbnails.value[currentStory.value.id] || '';
        });

        const getProgressWidth = (index: number) => {
            if (index < activeIndex.value) return 100;
            if (index > activeIndex.value) return 0;
            return progress.value;
        };

        // Interaction Handlers
        const handleDesktopClick = () => {
            if (isMobile.value) return;
            isPaused.value = !isPaused.value;
            if (videoRef.value) {
                isPaused.value ? videoRef.value.pause() : videoRef.value.play();
            }
        };

        const handlePressStart = () => {
            if (!isMobile.value) return;
            isPaused.value = true;
            if (videoRef.value) videoRef.value.pause();
        };

        const handlePressEnd = () => {
            if (!isMobile.value) return;
            isPaused.value = false;
            if (videoRef.value) videoRef.value.play();
        };

        // Media Event Hooks
        const onImageLoad = () => {
            if (currentStory.value) storiesStore.markAsRead(currentStory.value.id);
        };

        const onVideoMetadata = () => {
            if (videoRef.value) {
                currentDuration.value = videoRef.value.duration * 1000;
                // Generate thumbnail if missing
                if (!currentStory.value?.thumbnail && !generatedThumbnails.value[currentStory.value!.id]) {
                    const canvas = document.createElement('canvas');
                    canvas.width = videoRef.value.videoWidth;
                    canvas.height = videoRef.value.videoHeight;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(videoRef.value, 0, 0, canvas.width, canvas.height);
                    generatedThumbnails.value[currentStory.value!.id] = canvas.toDataURL('image/jpeg');
                }
            }
        };

        const onVideoPlaying = () => {
            videoStarted.value = true;
            isVideoLoading.value = false;
            if (currentStory.value) storiesStore.markAsRead(currentStory.value.id);
        };

        // Loop Logic
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

        // Lifecycle / API
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
            if (videoRef.value) {
                videoRef.value.pause();
                videoRef.value.src = ""; // Clear source to kill audio/speaker icon
                videoRef.value.load();
            }
        };

        onMounted(() => animationFrame = requestAnimationFrame(tick));
        onUnmounted(() => cancelAnimationFrame(animationFrame));

        expose({ closeStory, openStory } as StoryOverlayExposed);

        return {
            storiesStore,
            closeStory,
            nextStory,
            prevStory,
            stories,
            isOpen,
            activeIndex,
            currentStory,
            progress,
            isPaused,
            videoRef,
            getProgressWidth,
            onVideoMetadata,
            videoStarted,
            handlePressStart,
            handlePressEnd,
            isMobile,
            isVideoLoading,
            resolvedThumbnail,
            onVideoPlaying,
            onImageLoad,
            handleDesktopClick,
            resume: () => isPaused.value = false
        }
    }
})
</script>

<style scoped>
.transition-none {
    transition: none !important;
}
</style>