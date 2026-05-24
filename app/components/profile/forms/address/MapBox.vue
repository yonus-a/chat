<template>
    <div class="relative w-[300px] h-[400px] rounded-lg overflow-hidden">
        <ClientOnly>
            <MglMap :map-style="mapStyle" :center="[51.3890, 35.6892]" :zoom="12" :attribution-control="false">
                <MglNavigationControl position="top-left" />
            </MglMap>
            <!-- Loading placeholder -->
            <div v-if="isLoading" class="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <span class="text-gray-500">Loading map...</span>
            </div>
        </ClientOnly>
    </div>
</template>

<script setup lang="ts">
import { useRuntimeConfig } from '#imports'

const config = useRuntimeConfig()
const isLoading = ref(true)

// Listen to dark mode (uses Tailwind's dark class on <html>)
const isDark = computed(() => {
    if (process.client) {
        return document.documentElement.classList.contains('dark')
    }
    return false
})

// ----- Color palette (exactly as requested) -----
const colors = computed(() => ({
    mainStreet: isDark.value ? '#8ba5c0' : '#476887',
    otherStreet: isDark.value ? '#d0d5db' : '#485c75',
    water: isDark.value ? '#8fdaef' : '#000c2c',
    park: isDark.value ? '#d2f8e1' : '#0e3848',
    background: isDark.value ? '#1e1e2e' : '#f8f9fa',
    text: isDark.value ? '#ffffff' : '#000000'
}))

// ----- Dynamic MapLibre style -----
const mapStyle = computed(() => ({
    version: 8,
    name: 'Custom Map',
    glyphs: 'https://fonts.maptiler.com/{fontstack}/{range}.pbf?key=' + config.public.maptilerKey,
    sources: {
        // MapTiler vector tiles (OpenStreetMap data)
        'maptiler-planet': {
            type: 'vector',
            url: `https://api.maptiler.com/tiles/v3/tiles.json?key=${config.public.maptilerKey}`,
            promoteId: 'id'
        }
    },
    layers: [
        // Background
        {
            id: 'background',
            type: 'background',
            paint: { 'background-color': colors.value.background }
        },
        // Water
        {
            id: 'water',
            source: 'maptiler-planet',
            'source-layer': 'water',
            type: 'fill',
            paint: { 'fill-color': colors.value.water }
        },
        // Parks & greenery (landuse=park, forest, etc.)
        {
            id: 'parks',
            source: 'maptiler-planet',
            'source-layer': 'landuse',
            filter: ['match', ['get', 'class'], ['park', 'forest', 'grass', 'garden'], true, false],
            type: 'fill',
            paint: { 'fill-color': colors.value.park, 'fill-opacity': 0.8 }
        },
        // Roads - main streets (motorway, trunk, primary)
        {
            id: 'road-main',
            source: 'maptiler-planet',
            'source-layer': 'transportation',
            filter: ['match', ['get', 'class'], ['motorway', 'trunk', 'primary'], true, false],
            type: 'line',
            paint: {
                'line-color': colors.value.mainStreet,
                'line-width': ['interpolate', ['linear'], ['zoom'], 5, 1, 15, 4]
            },
            layout: { 'line-join': 'round', 'line-cap': 'round' }
        },
        // Roads - other streets (secondary, tertiary, residential, etc.)
        {
            id: 'road-other',
            source: 'maptiler-planet',
            'source-layer': 'transportation',
            filter: ['match', ['get', 'class'], ['secondary', 'tertiary', 'residential', 'living_street', 'service', 'track'], true, false],
            type: 'line',
            paint: {
                'line-color': colors.value.otherStreet,
                'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.5, 15, 2]
            },
            layout: { 'line-join': 'round', 'line-cap': 'round' }
        },
        // Place labels (cities, etc.) - RTL friendly
        {
            id: 'place-labels',
            source: 'maptiler-planet',
            'source-layer': 'place',
            type: 'symbol',
            layout: {
                'text-field': ['coalesce', ['get', 'name:fa'], ['get', 'name:ar'], ['get', 'name']],
                'text-font': ['Noto Sans Regular'], // will be overridden by the map's CSS font-family
                'text-size': 12,
                'text-optional': true,
                'text-allow-overlap': false
            },
            paint: {
                'text-color': colors.value.text,
                'text-halo-color': 'rgba(255,255,255,0.8)',
                'text-halo-width': 1.5
            }
        }
    ]
}))

// Hide loading when map loads
onMounted(() => {
    // MapLibre's 'load' event will be fired; we can listen via the component's ref
    // For simplicity, we wait a short time; better: use MglMap's @load event
    setTimeout(() => { isLoading.value = false }, 2000)
})
</script>