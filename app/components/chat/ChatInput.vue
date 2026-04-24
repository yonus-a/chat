<template>
    <div dir="rtl" ref="rootElements" :class="[(isRecording && !isLocked) || messageText.trim().length > 0 ? 'px-4' : 'px-4']"
        class=" transition-all duration-200 ease-in-out min-h-[76px] py-4 w-full bg-surface flex items-end border-t border-t-outline-variant gap-x-5 relative overflow-visible select-none touch-none">

        <div class="relative flex items-center justify-center shrink-0 z-30 mb-0.5" :style="{
            transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
        }">
            <div v-if="isRecording && !isLocked"
                class="absolute -top-20 flex flex-col items-center justify-center bg-surface shadow-floating rounded-full w-9 py-3 gap-y-3 transition-opacity pointer-events-none"
                :style="{ opacity: lockOpacity }">
                <BIcon icon="PhLockKey" class="w-5 h-5 fill-on-surface" />
                <BIcon icon="PhCaretUp" class="w-4 h-4 fill-on-surface/60 animate-bounce" />
            </div>

            <div class="flex items-center w-11 h-11 justify-center transition-all duration-200"
                :class="[(isRecording && !isLocked) || messageText.trim().length > 0 ? ' rounded-full bg-primary/10' : 'w-6 h-6 bg-primary/0']"
                @pointerdown="!isLocked ? handlePointerDown($event) : null">
                <BIcon v-if="!isLocked && messageText.trim().length == 0" :icon="secondaryMessageIcon"
                    :weight="isRecording ? 'fill' : 'regular'" class="cursor-pointer w-6 h-6 shrink-0 transition-colors"
                    :class="[isRecording ? ' fill-primary' : iconClass]" />
                <div v-else
                    class=" min-w-11 min-h-11 aspect-square rounded-full bg-gradient-primary-secondary flex items-center justify-center cursor-pointer">
                    <BIcon icon="PhPaperPlaneTilt" class=" w-6 h-6 fill-white shrink-0  " @click="sendRecording" />
                </div>
            </div>
        </div>

        <div v-show="!isRecording" class="flex-1 flex items-end gap-x-5">
            <div class=" min-h-11 flex items-center w-full">
                <textarea @keydown.enter.exact.prevent="sendMessage" @input="adjustHeight" ref="inputRef"
                    v-model="messageText" :disabled="inputDisabled" rows="1" :placeholder="inputPlaceholder"
                    class="text-body-md text-on-surface outline-none flex-1 bg-transparent z-10 resize-none  max-h-[144px] overflow-y-auto hide-scrollbar leading-6 py-1"></textarea>

            </div>
            <div class="shrink-0 flex items-center gap-x-8 z-10  h-11" :class="[iconClass]">
                <BMenu ref="menuRef">
                    <template #trigger>
                        <BIcon icon="PhSmiley" class="cursor-pointer w-6 h-6 fill-on-surface" @mousedown.prevent />
                    </template>
                    <div class="mb-4">
                        <BEmojiPicker @select="handleEmojiSelect" />
                    </div>
                </BMenu>

                <BIcon icon="PhPaperclipHorizontal"
                    class="-rotate-90 cursor-pointer w-6 h-6 fill-on-surface shrink-0" />
            </div>
        </div>

        <div v-show="isRecording" class="flex-1 flex items-center ">
            <div class="flex-1 flex justify-center items-center text-body-md text-on-surface/70 transition-opacity"
                :style="{ opacity: cancelOpacity }">
                <span v-if="!isLocked">{{ t('chat.swipeToCancel') }}</span>
                <span v-else class="text-primary cursor-pointer px-4 py-2 z-20" @click="cancelRecording">{{
                    t('chat.cancel')
                    }}</span>
            </div>

            <div class="absolute left-6 flex items-center gap-x-2 shrink-0 z-10">
                <div class="w-2.5 h-2.5 relative">
                    <div class="w-2.5 h-2.5 rounded-full bg-error"></div>
                    <div class="w-2.5 h-2.5 rounded-full bg-error animate-ping absolute top-0 left-0 inset-0"></div>
                </div>
                <span class="text-body-md min-w-12 text-center text-on-surface tabular-nums mt-0.5" dir="ltr">{{
                    formattedTime
                    }}</span>
            </div>
        </div>

    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onUnmounted, onMounted } from 'vue';
import { useI18n } from '#imports';
import { type Menu } from '~/types/components/menu';

export default defineComponent({
    name: 'ChatInput',
    props: {
        isActive: { type: Boolean, default: false }
    },
    emits: ['send'],
    setup(props, { expose, emit }) {
        const { t } = useI18n();

        const rootElements = ref<HTMLElement | null>(null)
        const inputWidth = computed(() => rootElements.value?.clientWidth)
        const micPermissionStatus = ref<PermissionState | 'unknown'>('unknown');
        const cameraPermissionStatus = ref<PermissionState | 'unknown'>('unknown');
        const menuRef = ref<Menu | null>(null)

        const handleMenuClose = () => {
            menuRef.value?.close()
        }

        const checkInitialPermissions = async () => {
            try {
                // Checking Microphone
                const micStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
                micPermissionStatus.value = micStatus.state;

                // Checking Camera
                const camStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
                cameraPermissionStatus.value = camStatus.state;

                console.log(`Initial Status - Mic: ${micPermissionStatus.value}, Cam: ${cameraPermissionStatus.value}`);
            } catch (err) {
                console.warn("Permissions API not fully supported or blocked by context.");
            }
        };

        const inputRef = ref<HTMLTextAreaElement | null>(null);
        const messageText = ref('');

        const adjustHeight = () => {
            const el = inputRef.value;
            if (!el) return;
            el.style.height = 'auto'; // Reset to calculate true height
            el.style.height = `${el.scrollHeight}px`;
        };

        // Method to handle focus
        const focus = () => {
            inputRef.value?.focus();
        };

        // Expose the method to parent components
        expose({
            focus: () => {
                console.log(inputRef.value)
                inputRef.value?.focus();
            }
        });


        const handleEmojiSelect = (emoji: string) => {
            const input = inputRef.value;
            if (!input) return;

            const start = input.selectionStart ?? messageText.value.length;
            const end = input.selectionEnd ?? messageText.value.length;

            messageText.value =
                messageText.value.substring(0, start) +
                emoji +
                messageText.value.substring(end);

            nextTick(() => {
                const newPos = start + emoji.length;
                input.setSelectionRange(newPos, newPos);
                input.focus();

                // Ensure textarea expands if an emoji wraps it to a new line
                adjustHeight();
            });
        };
        const ensurePermissions = async () => {
            const isVideo = secondaryMessageType.value === 'video';

            // If already granted, we can skip the prompt logic
            if (isVideo && cameraPermissionStatus.value === 'granted') return true;
            if (!isVideo && micPermissionStatus.value === 'granted') return true;

            try {
                const constraints = {
                    audio: true,
                    video: isVideo
                };

                // This is what triggers the actual browser popup
                const stream = await navigator.mediaDevices.getUserMedia(constraints);

                // Success! Immediately kill the tracks (no streaming allowed yet)
                stream.getTracks().forEach(track => track.stop());

                // Update local state
                if (isVideo) cameraPermissionStatus.value = 'granted';
                micPermissionStatus.value = 'granted';

                return true;
            } catch (err: any) {
                if (err.name === 'NotFoundError') {
                    console.error("Hardware missing. Mac mini has no camera.");
                } else if (err.name === 'NotAllowedError') {
                    console.error("User explicitly denied permission.");
                    if (isVideo) cameraPermissionStatus.value = 'denied';
                    micPermissionStatus.value = 'denied';
                }
                return false;
            }
        };

        // --- Core State ---
        const secondaryMessageType = ref<'video' | 'voice'>('voice');
        const inputDisabled = computed(() => !props.isActive);
        const inputPlaceholder = computed(() => props.isActive ? t('chat.placeholder') : t('chat.chatLocked'));
        const iconClass = computed(() => inputDisabled.value ? 'opacity-50 fill-on-surface pointer-events-none' : ' fill-on-surface opacity-100 pointer-events-auto');
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


        onMounted(() => {
            checkInitialPermissions();
        });


        const isPointerDown = ref(false);
        const sendMessage = () => {
            if (messageText.value.trim().length === 0) return;
            emit('send', messageText.value);
            messageText.value = '';

            // Reset textarea height back to 1 row after sending
            nextTick(() => {
                adjustHeight();
            });
        };

        const handlePointerDown = (event: PointerEvent) => {
            if (messageText.value.trim().length > 0) {
                sendMessage()
                return
            }
            handleMenuClose()
            isPointerDown.value = true;
            isLongPress.value = false;
            startX.value = event.clientX;
            startY.value = event.clientY;
            resetDrag();

            // BULLETPROOF FIX: Listen to the whole window for dragging and releasing
            // This prevents the button from becoming a "zombie" if the DOM resizes
            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', handlePointerUp);
            window.addEventListener('pointercancel', handlePointerUp);

            if (pressTimer.value) clearTimeout(pressTimer.value);

            pressTimer.value = setTimeout(async () => {
                isLongPress.value = true;
                const hasPermission = await ensurePermissions();

                if (hasPermission && isPointerDown.value) {
                    isDragging.value = true;
                    startRecording();
                }
            }, 400);
        };

        const handlePointerMove = (event: PointerEvent) => {
            if (messageText.value.trim().length > 0) return
            if (!isRecording.value || isLocked.value || !isDragging.value) return;

            const deltaX = event.clientX - startX.value;
            const deltaY = event.clientY - startY.value;

            // 1. Determine User Intent (Lock vs Cancel)
            if (!dragAxis.value) {
                if (deltaY < -10) dragAxis.value = 'y'; // UP
                else if (deltaX < -10) dragAxis.value = 'x'; // LEFT
            }

            // 2. Handle Axis Movement
            if (dragAxis.value === 'y') {
                dragOffset.value.y = Math.max(-100, Math.min(0, deltaY));
                if (dragOffset.value.y <= -60) lockRecording();
            }
            else if (dragAxis.value === 'x') {
                const cancelThreshold = inputWidth.value ? (inputWidth.value / 3) : 150;

                dragOffset.value.x = Math.max(-cancelThreshold, Math.min(0, deltaX));

                // INSTANT CANCEL: If they hit the threshold while dragging
                if (deltaX <= -cancelThreshold) {
                    cancelRecording();
                }
            }
        };

        const handlePointerUp = (event: PointerEvent) => {
            if (messageText.value.trim().length > 0) return
            isPointerDown.value = false;

            // Immediately clean up global listeners
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('pointercancel', handlePointerUp);

            if (pressTimer.value) {
                clearTimeout(pressTimer.value);
                pressTimer.value = null;
            }

            // 1. Quick tap -> Toggle Mode
            if (!isLongPress.value) {
                toggleSecondaryMessageType();
            }
            // 2. Was holding and recording, but NOT locked
            else if (isRecording.value && !isLocked.value) {
                // END DRAG CANCEL: If horizontal drag was initiated AT ALL, cancel it on release
                if (dragAxis.value === 'x') {
                    cancelRecording();
                } else {
                    // Otherwise send the message
                    sendRecording();
                }
            }

            resetDrag();
        };

        // Ensure listeners are wiped if the component unmounts mid-drag
        onUnmounted(() => {
            if (timerInterval) clearInterval(timerInterval);
            if (typeof window !== 'undefined') {
                window.removeEventListener('pointermove', handlePointerMove);
                window.removeEventListener('pointerup', handlePointerUp);
                window.removeEventListener('pointercancel', handlePointerUp);
            }
        });


        const checkAndRequestPermissions = async () => {
            const isVideo = secondaryMessageType.value === 'video';

            const constraints = {
                audio: true,
                video: isVideo
            };

            try {
                console.log(`Requesting permissions for: ${isVideo ? 'Video + Audio' : 'Audio Only'}`);

                // This MUST be called directly from a user-initiated event (like our pressTimer)
                const stream = await navigator.mediaDevices.getUserMedia(constraints);

                // Permission granted! Stop tracks immediately as we aren't streaming yet
                stream.getTracks().forEach(track => track.stop());

                console.log("Permissions cleared and granted.");
            } catch (err: any) {
                // This is likely why you don't see the popup on your Mac mini:
                if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                    console.error("HARDWARE ERROR: Browser skipped popup because no camera/mic was found.");
                    // If on Mac mini, try Voice mode instead of Video to see the prompt.
                } else {
                    console.error("PERMISSION ERROR: User denied or browser blocked the prompt.", err);
                }

                // If permission fails, we should stop the "Recording" visual state
                cancelRecording();
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
            inputRef,
            messageText,
            handleEmojiSelect,
            focus,
            formattedTime,
            lockOpacity,
            cancelOpacity,
            dragOffset,
            isDragging,
            handlePointerDown,
            handlePointerMove,
            handlePointerUp,
            adjustHeight,
            sendRecording,
            cancelRecording,
            menuRef,
            rootElements,
            sendMessage,
        };
    }
})
</script>