import { ref, computed, onUnmounted } from "vue";

interface RecordingCallbacks {
  onStart: () => void;
  onCancel: () => void;
  onSend?: (mediaUrl: string) => void;
  requestPermission: () => Promise<boolean>;
}

export function useChatRecording(callbacks: RecordingCallbacks) {
  const isRecording = ref(false);
  const isLocked = ref(false);
  const isPaused = ref(false);
  const recordingTime = ref(0);
  const mediaStream = ref<MediaStream | null>(null);
  const currentFacingMode = ref<"user" | "environment">("user");

  // Drag state
  const dragOffset = ref({ x: 0, y: 0 });
  const isDragging = ref(false);
  const dragAxis = ref<"x" | "y" | null>(null);
  const startPos = ref({ x: 0, y: 0 });

  // Long press detection
  const pressTimer = ref<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = ref(false);

  let timerInterval: ReturnType<typeof setInterval> | null = null;
  let mediaRecorder: MediaRecorder | null = null;
  let recordedChunks: Blob[] = [];

  const formattedTime = computed(() => {
    const m = Math.floor(recordingTime.value / 60);
    const s = recordingTime.value % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  });

  const lockOpacity = computed(() => {
    if (!isDragging.value || dragAxis.value !== "y") return 0;
    return Math.min(1, Math.abs(dragOffset.value.y) / 60);
  });

  const cancelOpacity = computed(() => {
    if (!isDragging.value || dragAxis.value !== "x") return 0;
    const threshold =
      typeof window !== "undefined" ? window.innerWidth / 3 : 200;
    return Math.min(1, Math.abs(dragOffset.value.x) / threshold);
  });

  function startTimer() {
    recordingTime.value = 0;
    timerInterval = setInterval(() => {
      recordingTime.value++;
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  async function onPointerDown(event: PointerEvent) {
    startPos.value = { x: event.clientX, y: event.clientY };
    isLongPress.value = false;

    pressTimer.value = setTimeout(async () => {
      isLongPress.value = true;
      const hasPermission = await callbacks.requestPermission();
      if (!hasPermission) return;

      isRecording.value = true;
      isDragging.value = true;
      callbacks.onStart();
      startTimer();
    }, 400);
  }

  function onPointerMove(event: PointerEvent) {
    if (!isRecording.value || isLocked.value) return;

    const dx = event.clientX - startPos.value.x;
    const dy = event.clientY - startPos.value.y;

    if (!dragAxis.value) {
      if (Math.abs(dx) > 10) dragAxis.value = "x";
      else if (Math.abs(dy) > 10) dragAxis.value = "y";
    }

    dragOffset.value = { x: dx, y: dy };

    // Cancel threshold (drag left)
    const cancelThreshold =
      typeof window !== "undefined" ? window.innerWidth / 3 : 200;
    if (dragAxis.value === "x" && Math.abs(dx) > cancelThreshold) {
      stopRecording(false);
      callbacks.onCancel();
    }

    // Lock threshold (drag up)
    if (dragAxis.value === "y" && dy < -60) {
      isLocked.value = true;
      isDragging.value = false;
      dragAxis.value = null;
      dragOffset.value = { x: 0, y: 0 };
    }
  }

  function onPointerUp() {
    if (pressTimer.value) {
      clearTimeout(pressTimer.value);
      pressTimer.value = null;
    }

    if (!isRecording.value) return;
    if (isLocked.value) return; // Keep recording in locked mode

    isDragging.value = false;
    dragAxis.value = null;
    dragOffset.value = { x: 0, y: 0 };

    stopRecording(true);
  }

  function toggleCamera() {
    currentFacingMode.value =
      currentFacingMode.value === "user" ? "environment" : "user";
  }

  function togglePause() {
    if (isPaused.value) {
      startTimer();
      mediaRecorder?.resume();
    } else {
      stopTimer();
      mediaRecorder?.pause();
    }
    isPaused.value = !isPaused.value;
  }

  function stopRecording(triggerSend: boolean) {
    stopTimer();
    isRecording.value = false;
    isLocked.value = false;
    isPaused.value = false;
    isDragging.value = false;
    dragAxis.value = null;
    dragOffset.value = { x: 0, y: 0 };

    if (mediaStream.value) {
      mediaStream.value.getTracks().forEach((track) => track.stop());
      mediaStream.value = null;
    }

    if (mediaRecorder && triggerSend) {
      mediaRecorder.stop();
    } else {
      recordedChunks = [];
    }
    mediaRecorder = null;

    if (triggerSend && callbacks.onSend) {
      // Create a blob URL for the recorded data
      if (recordedChunks.length > 0) {
        const blob = new Blob(recordedChunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        callbacks.onSend(url);
        recordedChunks = [];
      }
    }
  }

  onUnmounted(() => {
    stopTimer();
    if (mediaStream.value) {
      mediaStream.value.getTracks().forEach((track) => track.stop());
    }
  });

  return {
    isRecording,
    isLocked,
    isPaused,
    recordingTime,
    mediaStream,
    currentFacingMode,
    dragOffset,
    isDragging,
    dragAxis,
    isLongPress,
    formattedTime,
    lockOpacity,
    cancelOpacity,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    toggleCamera,
    togglePause,
    stopRecording,
  };
}
