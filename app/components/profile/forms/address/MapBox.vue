<template>
  <div class="relative w-[300px] h-[400px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
    <ClientOnly>
      <MglMap
        ref="mapRef"
        :map-style="currentStyle"
        :center="center"
        :zoom="zoom"
        :attribution-control="false"
        @load="onLoad"
      >
        <MglNavigationControl position="top-left" />
      </MglMap>

      <!-- Loading overlay -->
      <div
        v-if="!loaded"
        class="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center z-10"
      >
        <span class="text-sm text-gray-500 dark:text-gray-400">Loading map…</span>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useMapStyle } from '~/composables/useMapStyle'
import maplibregl from 'maplibre-gl'

const props = withDefaults(defineProps<{
  center?: [number, number]
  zoom?: number
}>(), {
  center: () => [51.3890, 35.6892],
  zoom: 12,
})

// ---------- Dark mode detection (no external lib) ----------
const isDark = ref(false)

if (import.meta.client) {
  // set initial value
  isDark.value = document.documentElement.classList.contains('dark')
  // watch for changes
  const observer = new MutationObserver(() => {
    isDark.value = document.documentElement.classList.contains('dark')
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  onUnmounted(() => observer.disconnect())
}

// ---------- Load RTL text plugin before any map ----------
onMounted(() => {
  if (maplibregl.getRTLTextPluginStatus() === 'unavailable') {
    maplibregl.setRTLTextPlugin(
      'https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.min.js',
      (error) => { if (error) console.error('RTL Plugin Error:', error) },
      true // load immediately
    )
  }
})

// ---------- Reactive style object ----------
const computedStyle = useMapStyle(isDark)   // returns a computed ref
const currentStyle = ref(computedStyle.value) // plain object, ready for map

// Keep currentStyle in sync whenever computed changes
watch(computedStyle, (newVal) => {
  currentStyle.value = newVal
  // If map is already loaded, apply new style directly
  if (mapRef.value?.map && loaded.value) {
    mapRef.value.map.setStyle(newVal)
  }
})

// ---------- Map state ----------
const mapRef = ref<any>(null)
const loaded = ref(false)

function onLoad() {
  loaded.value = true
}
</script>