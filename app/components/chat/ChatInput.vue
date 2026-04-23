<template>
    <div ref="rootElements" :class="[isRecording ? 'px-4' : 'px-6']"
        class=" transition-all duration-200 ease-in-out h-19 w-full bg-surface flex items-center border-t border-t-outline-variant gap-x-5 relative overflow-visible select-none touch-none">

        <div class="relative flex items-center justify-center shrink-0 z-30" :style="{
            transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
        }">

            <div v-if="isRecording && !isLocked"
                class="absolute -top-20 flex flex-col items-center justify-center bg-surface border border-outline-variant shadow-sm rounded-full w-10 py-3 gap-y-1 transition-opacity pointer-events-none"
                :style="{ opacity: lockOpacity }">
                <BIcon icon="PhLockKey" class="w-5 h-5 fill-on-surface" />
                <BIcon icon="PhCaretUp" class="w-4 h-4 fill-on-surface/60 animate-bounce" />
            </div>

            <div class="flex items-center justify-center transition-all duration-200"
                :class="[isRecording && !isLocked ? 'w-14 h-14 rounded-full bg-[#E6F4EA] dark:bg-primary/20' : 'w-6 h-6 bg-transparent']"
                @pointerdown="!isLocked ? handlePointerDown($event) : null"
                @pointermove="isDragging ? handlePointerMove($event) : null"
                @pointerup="isDragging ? handlePointerUp($event) : null"
                @pointercancel="isDragging ? handlePointerUp($event) : null">
                <BIcon v-if="!isLocked" :icon="secondaryMessageIcon"
                    class="cursor-pointer w-6 h-6 shrink-0 transition-colors"
                    :class="[isRecording ? 'fill-[#00BFA5] dark:fill-primary' : iconClass]" />
                <BIcon v-else icon="PhPaperPlaneRight"
                    class="cursor-pointer w-6 h-6 fill-primary shrink-0 transition-transform hover:scale-110"
                    @click="sendRecording" />
            </div>
        </div>

        <template v-if="!isRecording">
            <input :disabled="inputDisabled" type="text" :placeholder="inputPlaceholder"
                class="text-body-md text-on-surface outline-none flex-1 bg-transparent z-10">

            <div class="shrink-0 flex items-center gap-x-8 z-10" :class="[iconClass]">
                <BIcon icon="PhSmiley" class="cursor-pointer w-6 h-6 fill-on-surface shrink-0" />
                <BIcon icon="PhPaperclipHorizontal"
                    class="-rotate-90 cursor-pointer w-6 h-6 fill-on-surface shrink-0" />
            </div>
        </template>

        <template v-else>
            <div class="flex-1 flex justify-center items-center text-body-md text-on-surface/70 transition-opacity"
                :style="{ opacity: cancelOpacity }">
                <span v-if="!isLocked">{{ t('chat.swipeToCancel', 'برای لغو بکشید') }}</span>
                <span v-else class="text-error cursor-pointer font-bold px-4 py-2 z-20" @click="cancelRecording">{{
                    t('chat.cancel', 'لغو') }}</span>
            </div>

            <div class="absolute left-6 flex items-center gap-x-2 shrink-0 z-10">
                <div class="w-2.5 h-2.5 rounded-full bg-error animate-pulse"></div>
                <span class="text-body-md text-on-surface tabular-nums mt-0.5" dir="ltr">{{ formattedTime }}</span>
            </div>
        </template>

    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onUnmounted } from 'vue';
import { useI18n } from '#imports';

export default defineComponent({
    name: 'ChatInput',
    props: {
        isActive: { type: Boolean, default: false }
    },
    setup(props) {
        const { t } = useI18n();

        const rootElements = ref<HTMLElement | null>(null)
        const inputWidth = computed(() => rootElements.value?.clientWidth)

        // --- Core State ---
        const secondaryMessageType = ref<'video' | 'voice'>('voice');
        const inputDisabled = computed(() => !props.isActive);
        const inputPlaceholder = computed(() => props.isActive ? t('chat.placeholder') : t('chat.chatLocked'));
        const iconClass = computed(() => inputDisabled.value ? 'opacity-50 pointer-events-none' : 'opacity-100 pointer-events-auto');
        const secondaryMessageIcon = computed(() => secondaryMessageType.value === 'voice' ? 'PhMicrophone' : 'PhCamera');

        // --- Recording & Drag State ---
        const isRecording = ref(false);
        const isLocked = ref(false);
        const recordingTime = ref(0);
        let timerInterval: ReturnType<typeof setInterval> | null = null;

        const isDragging = ref(false);
        const startX = ref(0);
        const startY = ref(0);
        const dragOffset = ref({ x: 0, y: 0 });
        const dragAxis = ref<'x' | 'y' | null>(null);

        const pressTimer = ref<ReturnType<typeof setTimeout> | null>(null);
        const isLongPress = ref(false);

        // --- Computed Visuals ---
        const formattedTime = computed(() => {
            const m = Math.floor(recordingTime.value / 60).toString().padStart(2, '0');
            const s = (recordingTime.value % 60).toString().padStart(2, '0');
            return `${m}:${s}`;
        });

        // Fades lock pill if dragging sideways
        const lockOpacity = computed(() => {
            if (dragAxis.value === 'x') return 0;
            return 1;
        });

        // Fades out cancel text as user drags towards it
        const cancelOpacity = computed(() => {
            if (dragAxis.value === 'y') return 1;
            const progress = Math.min(Math.abs(dragOffset.value.x) / 80, 1);
            return 1 - progress;
        });

        // --- Actions ---
        const toggleSecondaryMessageType = () => {
            secondaryMessageType.value = secondaryMessageType.value === 'voice' ? 'video' : 'voice';
        };

        const startRecording = () => {
            isRecording.value = true;
            recordingTime.value = 0;
            timerInterval = setInterval(() => {
                recordingTime.value++;
            }, 1000);
        };

        const stopRecording = () => {
            if (timerInterval) clearInterval(timerInterval);
            isRecording.value = false;
            isLocked.value = false;
            recordingTime.value = 0;
            resetDrag();
        };

        const sendRecording = () => {
            console.log(`Sending ${secondaryMessageType.value} message. Duration: ${recordingTime.value}s`);
            stopRecording();
        };

        const cancelRecording = () => {
            console.log("Recording Canceled.");
            stopRecording();
        };

        const resetDrag = () => {
            isDragging.value = false;
            dragOffset.value = { x: 0, y: 0 };
            dragAxis.value = null;
        };

        const lockRecording = () => {
            isLocked.value = true;
            resetDrag(); // Snap button back to center
        };

        // --- Pointer Event Handlers ---
        const handlePointerDown = (event: PointerEvent) => {
            const target = event.currentTarget as HTMLElement;
            if (event.pointerType === 'touch' && target.setPointerCapture) {
                target.setPointerCapture(event.pointerId);
            }

            isLongPress.value = false;
            startX.value = event.clientX;
            startY.value = event.clientY;
            resetDrag();

            if (pressTimer.value) clearTimeout(pressTimer.value);

            // 400ms threshold for Hold
            pressTimer.value = setTimeout(() => {
                isLongPress.value = true;
                isDragging.value = true;
                startRecording();
            }, 400);
        };

        const handlePointerMove = (event: PointerEvent) => {
            if (!isRecording.value || isLocked.value || !isDragging.value) return;

            const deltaX = event.clientX - startX.value;
            const deltaY = event.clientY - startY.value;

            // 1. Determine User Intent
            if (!dragAxis.value) {
                if (deltaY < -10) dragAxis.value = 'y';
                else if (deltaX < -10) dragAxis.value = 'x';
            }

            // 2. Handle Axis Movement
            if (dragAxis.value === 'y') {
                dragOffset.value.y = Math.max(-100, Math.min(0, deltaY));
                if (dragOffset.value.y <= -60) lockRecording();
            }
            else if (dragAxis.value === 'x') {
                // --- DYNAMIC CANCEL THRESHOLD ---
                // We use half the width, falling back to 150 if width is not available
                const cancelThreshold = inputWidth.value ? (inputWidth.value / 2) : 150;

                // Clamp the visual movement to the threshold
                dragOffset.value.x = Math.max(-cancelThreshold, Math.min(0, deltaX));

                // Trigger cancel if we pass the halfway point
                if (Math.abs(dragOffset.value.x) >= cancelThreshold) {
                    cancelRecording();
                }
            }
        };

        const handlePointerUp = (event: PointerEvent) => {
            if (pressTimer.value) {
                clearTimeout(pressTimer.value);
                pressTimer.value = null;
            }

            if (!isLongPress.value) {
                // Was just a quick tap
                toggleSecondaryMessageType();
            } else if (isRecording.value && !isLocked.value && dragAxis.value !== 'x') {
                // Released the hold without locking or canceling -> Send Message
                sendRecording();
            }

            resetDrag();

            const target = event.currentTarget as HTMLElement;
            if (event.pointerType === 'touch' && target.releasePointerCapture) {
                target.releasePointerCapture(event.pointerId);
            }
        };

        onUnmounted(() => {
            if (timerInterval) clearInterval(timerInterval);
        });

        return {
            t,
            inputDisabled,
            inputPlaceholder,
            iconClass,
            secondaryMessageIcon,
            isRecording,
            isLocked,
            formattedTime,
            lockOpacity,
            cancelOpacity,
            dragOffset,
            isDragging,
            handlePointerDown,
            handlePointerMove,
            handlePointerUp,
            sendRecording,
            cancelRecording,
            rootElements,
        };
    }
})
</script>