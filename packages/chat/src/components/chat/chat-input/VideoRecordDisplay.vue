<template>
  <div class="video-record">
    <video
      ref="videoRef"
      class="video-record__preview"
      autoplay
      muted
      playsinline
    ></video>
    <div class="video-record__controls">
      <button class="video-record__btn" @click="$emit('flipCamera')">
        <BIcon name="camera-rotate" :size="20" />
      </button>
      <div class="video-record__timer">
        <span class="video-record__dot"></span>
        {{ formattedTime }}
      </div>
      <button class="video-record__btn video-record__btn--stop" @click="$emit('stop')">
        <BIcon name="stop" :size="20" weight="fill" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import BIcon from "../../global/BIcon.vue";

const props = defineProps<{
  stream?: MediaStream | null;
  formattedTime: string;
}>();

defineEmits<{
  flipCamera: [];
  stop: [];
}>();

const videoRef = ref<HTMLVideoElement | null>(null);

function setStream() {
  if (videoRef.value && props.stream) {
    videoRef.value.srcObject = props.stream;
  }
}

onMounted(setStream);
watch(() => props.stream, setStream);
</script>

<style scoped>
.video-record {
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
  max-height: 300px;
  background: #000;
  border-radius: var(--chat-radius-lg);
  overflow: hidden;
}

.video-record__preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-record__controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--chat-spacing-md);
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
}

.video-record__btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.video-record__btn--stop {
  background: var(--chat-error);
}

.video-record__timer {
  display: flex;
  align-items: center;
  gap: var(--chat-spacing-xs);
  color: white;
  font-size: var(--chat-font-size-sm);
}

.video-record__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--chat-error);
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>
