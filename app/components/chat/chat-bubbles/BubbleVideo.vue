<template>
    <div class="relative w-60.5 h-60.5 p-2 shrink-0 group select-none flex items-center justify-center">

        <svg class="absolute w-57.5 h-57.5 -rotate-90 pointer-events-none z-20" viewBox="0 0 230 230">
            <circle cx="115" cy="115" r="113" 
                :class="[isUploading ? 'stroke-white/30' : 'stroke-white dark:stroke-surface']" 
                stroke-width="4" fill="none" />

            <circle cx="115" cy="115" r="113" class="stroke-primary transition-all ease-linear"
                :class="[isPlaying || isUploading ? 'duration-200' : 'duration-75']" stroke-width="4" fill="none"
                stroke-linecap="round" :stroke-dasharray="circumference" :stroke-dashoffset="dashOffset" />
        </svg>

        <div class="relative w-54.5 h-54.5 shrink-0 rounded-full overflow-hidden bg-[#1C1E22] z-10"
            :class="[isUploading ? 'cursor-default' : 'cursor-pointer']" @click="togglePlay">

            <video ref="videoRef" :src="mode === 'playback' ? videoUrl : undefined" :poster="thumbnail" playsinline loop
                muted class="w-full h-full object-cover transition-opacity duration-300"
                :class="[isLoaded || mode === 'recording' ? 'opacity-100' : 'opacity-0']" @timeupdate="handleTimeUpdate"
                @ended="handleEnded" @play="handlePlay" @pause="handlePause" @loadeddata="isLoaded = true"></video>

            <div v-if="!isLoaded && mode === 'playback'"
                class="absolute inset-0 flex items-center justify-center bg-surface ">
            </div>

            <div v-if="mode === 'playback' && !isUploading"
                class="absolute inset-0 flex items-center justify-center transition-all duration-300"
                :class="[isPlaying ? 'bg-transparent opacity-0' : '  bg-black/30 opacity-100']">
                <BIcon :icon="isPlaying ? 'PhPause' : 'PhPlay'" weight="light"
                    class="w-5 h-5 text-white transition-transform duration-300"
                    :class="[isPlaying ? 'scale-75' : 'scale-100 ml-1']" />
            </div>

            <div v-if="isUploading" class="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
                <BIcon icon="PhUploadSimple" class="w-6 h-6 text-white" />
            </div>

            <div v-if="mode === 'recording'"
                class="absolute top-4 left-1/2 -translate-x-1/2 flex items-center justify-center gap-x-1">
                <div class="w-2 h-2 rounded-full bg-error animate-pulse"></div>
            </div>

        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted, onBeforeUnmount, type PropType } from 'vue';
import { useChatActionStore } from '~/stores/chatActionStore';

export default defineComponent({
    name: 'VideoMessage',
    props: {
        videoUrl: {
            type: String,
            default: ''
        },
        thumbnail: {
            type: String,
            default: ''
        },
        mode: {
            type: String as () => 'playback' | 'recording',
            default: 'playback'
        },
        stream: {
            type: Object as PropType<MediaStream | null>,
            default: null
        },
        messageId: { 
            type: Number, 
            required: false 
        },
        isSent: { 
            type: Boolean, 
            default: true 
        }
    },
    setup(props) {
        const chatActionStore = useChatActionStore();
        const videoRef = ref<HTMLVideoElement | null>(null);
        const isPlaying = ref(false);
        const isLoaded = ref(false);
        const progress = ref(0);

        // --- Upload State ---
        const uploadData = computed(() => props.messageId ? chatActionStore.uploadProgress.get(props.messageId) : null);
        const isUploading = computed(() => !props.isSent && uploadData.value);

        // --- SVG Math ---
        const circumference = 2 * Math.PI * 115;
        const dashOffset = computed(() => {
            // 1. If uploading, map the dash to the store's upload progress
            if (isUploading.value && uploadData.value) {
                return circumference - (uploadData.value.progress / 100) * circumference;
            }
            
            // 2. If recording, fill the circle completely to show camera is active
            if (props.mode === 'recording') return 0;

            // 3. Otherwise, map to the standard video playback progress
            return circumference - (progress.value / 100) * circumference;
        });

        // --- Playback Logic ---
        const togglePlay = () => {
            if (props.mode === 'recording' || !videoRef.value || isUploading.value) return;

            if (isPlaying.value) {
                videoRef.value.pause();
            } else {
                videoRef.value.play();
            }
        };

        const handleTimeUpdate = () => {
            if (!videoRef.value || props.mode === 'recording' || isUploading.value) return;
            const current = videoRef.value.currentTime;
            const total = videoRef.value.duration;
            if (total) {
                progress.value = (current / total) * 100;
            }
        };

        const handleEnded = () => {
            isPlaying.value = false;
            progress.value = 0;
            if (videoRef.value) videoRef.value.currentTime = 0;
        };

        const handlePlay = () => { isPlaying.value = true; };
        const handlePause = () => { isPlaying.value = false; };

        // --- Recording Stream Logic ---
        watch(() => props.stream, (newStream) => {
            if (props.mode === 'recording' && videoRef.value) {
                if (newStream) {
                    videoRef.value.srcObject = newStream;
                    videoRef.value.play(); 
                } else {
                    videoRef.value.srcObject = null;
                }
            }
        }, { immediate: true });

        onBeforeUnmount(() => {
            if (videoRef.value) {
                videoRef.value.srcObject = null;
            }
        });

        return {
            videoRef,
            isPlaying,
            isLoaded,
            circumference,
            dashOffset,
            isUploading,
            togglePlay,
            handleTimeUpdate,
            handleEnded,
            handlePlay,
            handlePause,
        };
    }
});
</script>