<template>
  <!-- 
    1. Bind the dynamic 'style' from clamped coordinates.
    2. touch-none prevents page scrolling while dragging on mobile.
    3. cursor-move indicates it's draggable.
    4. Transition class is ONLY applied when NOT dragging for snap animation.
  -->
  <div 
    v-if="callStore.isActive && callStore.isPiP"
    ref="pipContainer"
    :style="clampedStyle"
    class="fixed w-48 h-64 sm:w-56 sm:h-72 bg-black-600 rounded-2xl shadow-2xl z-[9999] overflow-hidden border border-white/10 flex flex-col cursor-move touch-none"
    :class="[
        !isDragging ? 'transition-all duration-300 ease-out' : ''
    ]"
  >
    <!-- Video Stream Container -->
    <div class="relative flex-1 bg-black overflow-hidden pointer-events-none">
        <video 
            ref="pipVideo"
            autoplay 
            playsinline 
            muted
            class="w-full h-full object-cover"
            :class="{ 'scale-x-[-1]': !callStore.isSharingScreen }"
        ></video>
        
        <!-- Controls Overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-between">
            <div class="flex justify-end gap-x-2 pointer-events-auto">
                <!-- Native Browser PiP Button (Pop out of app entirely) -->
                <button v-if="supportsNativePiP" @click.stop="toggleNativePiP" class="bg-black/50 hover:bg-black/80 p-2 rounded-full transition-colors backdrop-blur-md" title="Pop out of browser">
                    <BIcon icon="PhCopySimple" class="w-4 h-4 fill-white" />
                </button>

                <!-- Maximize back to full Nuxt route -->
                <button @click.stop="maximizeCall" class="bg-black/50 hover:bg-black/80 p-2 rounded-full transition-colors backdrop-blur-md" title="Return to call">
                    <BIcon icon="PhCornersOut" class="w-4 h-4 fill-white" />
                </button>
            </div>
            
            <div class="flex flex-col">
                <div class="text-white text-xs font-medium truncate drop-shadow-md">
                    {{ callStore.chatContact?.name }} {{ callStore.chatContact?.lastName }}
                </div>
                <div class="text-primary text-[10px] font-mono drop-shadow-md">{{ formattedTime }}</div>
            </div>
        </div>
    </div>

    <!-- Quick Toolbelt -->
    <!-- pointer-events-auto ensures buttons work, @mousedown.stop prevents dragging when clicking buttons -->
    <div class="h-12 bg-black-500 flex items-center justify-around px-2 border-t border-white/5 pointer-events-auto" @mousedown.stop @touchstart.stop>
        <BIcon 
            :icon="callStore.isMicMuted ? 'PhMicrophoneSlash' : 'PhMicrophone'" 
            @click.stop="callStore.toggleMic"
            class="w-5 h-5 fill-white cursor-pointer hover:fill-primary transition-colors" 
        />
        <div @click.stop="callStore.stopCall" class="bg-diamond-error rounded-full p-2 cursor-pointer hover:scale-110 transition-transform">
            <BIcon icon="PhPhoneX" class="w-4 h-4 fill-white" />
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useDraggable, useWindowSize } from '@vueuse/core';
import { useRouter } from 'vue-router';
// Make sure to import your store and format utility correctly based on your project structure
// import { useCallStore } from '~/stores/useCallStore';
// import { formatDuration } from '~/utils/formatters';

const callStore = useCallStore();
const router = useRouter();

const pipContainer = ref<HTMLElement | null>(null);
const pipVideo = ref<HTMLVideoElement | null>(null);
const supportsNativePiP = ref(false);

const { width: windowWidth, height: windowHeight } = useWindowSize();

// --- DRAG LOGIC WITH BOUNDARIES & CORNER SNAPPING ---
// Using the larger dimensions (sm breakpoints) to ensure it never clips off-screen
const PIP_WIDTH = 224; 
const PIP_HEIGHT = 288; 
const PADDING = 24;

// 1. Initialize Draggable
const { x, y, isDragging } = useDraggable(pipContainer, {
    initialValue: { 
        x: typeof window !== 'undefined' ? window.innerWidth - PIP_WIDTH - PADDING : 0, 
        y: typeof window !== 'undefined' ? window.innerHeight - PIP_HEIGHT - PADDING : 0 
    },
});

// 2. Snap to Closest Corner on Release
watch(isDragging, (dragging) => {
    if (!dragging) {
        const maxX = windowWidth.value - PIP_WIDTH - PADDING;
        const maxY = windowHeight.value - PIP_HEIGHT - PADDING;

        // Find midpoints to determine which corner is closest
        const targetX = x.value < (windowWidth.value / 2) ? PADDING : maxX;
        const targetY = y.value < (windowHeight.value / 2) ? PADDING : maxY;

        x.value = targetX;
        y.value = targetY;
    }
});

// 3. Clamp coordinates during drag so it can't leave the viewport
const clampedStyle = computed(() => {
    const maxX = windowWidth.value - PIP_WIDTH - PADDING;
    const maxY = windowHeight.value - PIP_HEIGHT - PADDING;
    
    const safeX = Math.max(PADDING, Math.min(x.value, maxX));
    const safeY = Math.max(PADDING, Math.min(y.value, maxY));

    return {
        left: `${safeX}px`,
        top: `${safeY}px`
    };
});

// --- TIME FORMATTING ---
const formattedTime = computed(() => {
    const s = callStore.elapsedTime;
    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;

    const padded = (val: number) => val.toString().padStart(2, "0");
    if (hours > 0) return `${padded(hours)}:${padded(minutes)}:${padded(seconds)}`;
    return `${padded(minutes)}:${padded(seconds)}`;
});

// --- ACTIONS ---
const maximizeCall = async () => {
    callStore.isPiP = false;
    // Close native PiP if it's active before routing
    if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
    }
    router.push(`/dashboard/chat/${callStore.chatContact?.id}/call`);
};

// --- NATIVE OS PIP FALLBACK ---
const toggleNativePiP = async () => {
    try {
        if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
        } else if (pipVideo.value) {
            await pipVideo.value.requestPictureInPicture();
        }
    } catch (error) {
        console.error("Native PiP failed:", error);
    }
};

// Check for native browser PiP support
onMounted(() => {
    supportsNativePiP.value = typeof document !== 'undefined' && 'pictureInPictureEnabled' in document;
});

// --- STREAM BINDING ---
const updateStream = () => {
    if (pipVideo.value && callStore.localStream) {
        pipVideo.value.srcObject = callStore.isSharingScreen 
            ? callStore.screenStream 
            : callStore.localStream;
    }
};

// Re-bind the video stream automatically when PiP opens or screen sharing toggles
watch(() => [callStore.isPiP, callStore.localStream, callStore.isSharingScreen], () => {
    if (callStore.isPiP) {
        nextTick(() => updateStream());
    }
}, { immediate: true });
</script>