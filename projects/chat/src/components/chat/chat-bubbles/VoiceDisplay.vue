<template>
  <div class="voice-display">
    <button class="voice-display__play" @click="togglePlay">
      <BIcon :name="isPlaying ? 'pause' : 'play'" :size="20" weight="fill" />
    </button>
    <div class="voice-display__waveform">
      <div
        v-for="(bar, idx) in waveformBars"
        :key="idx"
        class="voice-display__bar"
        :style="{ height: bar + '%', opacity: idx <= playedBars ? 1 : 0.4 }"
      ></div>
    </div>
    <span class="voice-display__time">{{ displayTime }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from "vue";
import BIcon from "../../global/BIcon.vue";
import { formatCountdown } from "../../../utils/format";

const props = defineProps<{
  voiceUrl?: string;
  duration?: number;
}>();

const isPlaying = ref(false);
const currentTime = ref(0);
let audio: HTMLAudioElement | null = null;
let animFrame: number | null = null;

// Generate pseudo-random waveform bars
const waveformBars = computed(() => {
  const count = 30;
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    bars.push(30 + Math.sin(i * 0.5) * 30 + Math.random() * 40);
  }
  return bars;
});

const totalDuration = computed(() => props.duration || 0);
const playedBars = computed(() => {
  if (totalDuration.value === 0) return 0;
  return Math.floor((currentTime.value / totalDuration.value) * waveformBars.value.length);
});

const displayTime = computed(() => {
  const time = isPlaying.value ? currentTime.value : totalDuration.value;
  return formatCountdown(Math.floor(time));
});

function togglePlay() {
  if (!props.voiceUrl) return;

  if (!audio) {
    audio = new Audio(props.voiceUrl);
    audio.addEventListener("ended", () => {
      isPlaying.value = false;
      currentTime.value = 0;
    });
    audio.addEventListener("loadedmetadata", () => {
      if (audio && audio.duration && isFinite(audio.duration)) {
        // Use actual duration if available
      }
    });
  }

  if (isPlaying.value) {
    audio.pause();
    isPlaying.value = false;
    if (animFrame) cancelAnimationFrame(animFrame);
  } else {
    audio.play();
    isPlaying.value = true;
    updateTime();
  }
}

function updateTime() {
  if (audio && isPlaying.value) {
    currentTime.value = audio.currentTime;
    animFrame = requestAnimationFrame(updateTime);
  }
}

onUnmounted(() => {
  if (audio) {
    audio.pause();
    audio = null;
  }
  if (animFrame) cancelAnimationFrame(animFrame);
});
</script>

<style scoped>
.voice-display {
  display: flex;
  align-items: center;
  gap: var(--chat-spacing-sm);
  padding: var(--chat-spacing-sm);
  min-width: 200px;
}

.voice-display__play {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--chat-primary);
  color: var(--chat-text-inverse);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.voice-display__waveform {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
  height: 32px;
}

.voice-display__bar {
  width: 3px;
  background: currentColor;
  border-radius: 2px;
  min-height: 4px;
  transition: opacity var(--chat-transition-fast);
}

.voice-display__time {
  font-size: var(--chat-font-size-xs);
  opacity: 0.7;
  min-width: 40px;
  text-align: center;
}
</style>
