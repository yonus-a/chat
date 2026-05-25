<template>
  <div class="bubble-video">
    <video
      v-if="videoUrl"
      ref="videoRef"
      :src="videoUrl"
      class="bubble-video__player"
      @click="togglePlay"
      preload="metadata"
    ></video>
    <div class="bubble-video__overlay" v-if="!isPlaying" @click="togglePlay">
      <BIcon name="play" :size="32" weight="fill" />
    </div>
    <div v-if="progress !== undefined && progress < 100" class="bubble-video__progress">
      <svg viewBox="0 0 36 36" class="bubble-video__circle">
        <path
          class="bubble-video__circle-bg"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path
          class="bubble-video__circle-fill"
          :stroke-dasharray="`${progress}, 100`"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import BIcon from "../../global/BIcon.vue";

defineProps<{
  videoUrl?: string;
  progress?: number;
}>();

const videoRef = ref<HTMLVideoElement | null>(null);
const isPlaying = ref(false);

function togglePlay() {
  if (!videoRef.value) return;
  if (isPlaying.value) {
    videoRef.value.pause();
    isPlaying.value = false;
  } else {
    videoRef.value.play();
    isPlaying.value = true;
  }
}
</script>

<style scoped>
.bubble-video {
  position: relative;
  border-radius: var(--chat-radius-md);
  overflow: hidden;
  max-width: 280px;
  background: #000;
}

.bubble-video__player {
  width: 100%;
  display: block;
  cursor: pointer;
}

.bubble-video__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  cursor: pointer;
}

.bubble-video__progress {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
}

.bubble-video__circle {
  width: 48px;
  height: 48px;
  transform: rotate(-90deg);
}

.bubble-video__circle-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.3);
  stroke-width: 2;
}

.bubble-video__circle-fill {
  fill: none;
  stroke: white;
  stroke-width: 2;
  stroke-linecap: round;
}
</style>
