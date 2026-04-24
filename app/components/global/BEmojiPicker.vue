<template>
  <ClientOnly>
    <div class="b-emoji-picker relative" @click.stop>
      <emoji-picker ref="picker" data-source="/data/emoji-data.json" class="light"
        @emoji-click="$emit('select', $event.detail.unicode)"></emoji-picker>
    </div>

    <template #fallback>
      <div class="w-[350px] h-[350px] bg-surface/50 animate-pulse rounded-2xl border border-outline-variant" />
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const emit = defineEmits(['select']);
const picker = ref<HTMLElement | null>(null);
let shadowHunter: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  // Nuxt's ClientOnly delays the shadow root. We hunt for it every 50ms until it exists.
  shadowHunter = setInterval(() => {
    if (picker.value && picker.value.shadowRoot) {
      clearInterval(shadowHunter!); // We found it, stop hunting.

      const style = document.createElement('style');
      style.textContent = `
        /* 1. ANNIHILATE THE SEARCH ROW AND NAV */
        .search-row, 
        [part="search"], 
        nav, 
        [part="nav"] {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          height: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
          pointer-events: none !important;
          position: absolute !important;
        }

        /* 2. STYLE THE SCROLLBAR EXACTLY AS REQUESTED */
        .tabpanel::-webkit-scrollbar {
          width: 2px !important;
          height: 2px !important;
        }

        .tabpanel::-webkit-scrollbar-thumb {
          background: var(--background-image-gradient-primary-secondary) !important;
          border-radius: 10px !important;
        }
        
        /* 3. ENSURE TRANSPARENCY */
        section, .tabpanel {
          background: transparent !important;
        }
      `;

      picker.value.shadowRoot.appendChild(style);
    }
  }, 50);

  // Safety clear just in case the element never renders
  setTimeout(() => {
    if (shadowHunter) clearInterval(shadowHunter);
  }, 5000);
});

onUnmounted(() => {
  if (shadowHunter) clearInterval(shadowHunter);
});
</script>

<style scoped>
emoji-picker {
  /* Nuke outer bounds and background */
  --background: transparent;
  --border-size: 0;
  --border-color: transparent;
  --input-border-size: 0;
  --button-hover-background: transparent;
  --button-active-background: transparent;
  --indicator-color: var(--color-primary);
  max-width: 350px;
  height: 350px;
  /* Adjust height since we removed the top bar */
  border: none !important;
}
</style>