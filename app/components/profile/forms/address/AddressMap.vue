<!-- components/AddressMap.vue -->
<template>
    <div class="relative">
        <div class="map-wrapper" ref="mapContainer"></div>
        <div
            class="absolute z-1000 w-7 h-7 rtl:right-2 ltr:left-2 bottom-2 cursor-pointer rounded-full bg-surface flex items-center justify-center"
            @click="handleUserLocation">
            <BIcon icon="PhGpsFix" class="w-5 h-5 fill-on-surface" />
        </div>
        <div
            class="pointer-events-none absolute z-2000 w-full h-full inset-0 top-0 left-0 flex items-center justify-center">
            <!-- Marker with lift animation -->
            <div :class="{ '-translate-y-2': isDragging }" class="transition-transform duration-200">
                <BImage :src="locationMarker" class="max-h-10 h-10 w-9 min-w-9 min-h-10 max-w-9" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useMapStyle } from '~/composables/useMapStyle'
import { useAppPermissions } from '~/composables/useAppPermissions'
import { useLocation } from '~/composables/useLocation'
import locationMarker from '/images/profile/location-marker.svg'

const mapContainer = ref<HTMLElement | null>(null)
const map = ref<maplibregl.Map | null>(null)
const { mapStyle } = useMapStyle()
const { requestLocation } = useAppPermissions()
const { permissionStatus, requestBrowserLocation, checkPermission } = useLocation()
const isDragging = ref(false)

const emit = defineEmits<{
    'map-center': [payload: { lat: number; lng: number }]
    'map-click': [payload: { lat: number; lng: number }]
    'request-location-permission': []
}>()

// Emit current map center
const emitCurrentCenter = () => {
    if (!map.value) return
    const center = map.value.getCenter()
    emit('map-center', { lat: center.lat, lng: center.lng })
}

// Fly to user location if permission granted
const flyToUserLocation = async () => {
    try {
        const pos = await requestBrowserLocation()
        if (map.value) {
            map.value.flyTo({
                center: [pos.longitude, pos.latitude],
                zoom: 14,
                essential: true,
                duration: 500
            })
            emitCurrentCenter()
        }
    } catch (error) {
        // Permission denied or unavailable → ask parent to show permission popup
        emit('request-location-permission')
    }
}

// GPS button click handler
const handleUserLocation = async () => {
    await checkPermission() // refresh current permission status
    if (permissionStatus.value === 'granted') {
        await flyToUserLocation()
    } else {
        emit('request-location-permission')
    }
}

onMounted(async () => {
    if (!mapContainer.value) return

    // Load RTL text plugin (Persian / Arabic)
    if (maplibregl.getRTLTextPluginStatus() === 'unavailable') {
        maplibregl.setRTLTextPlugin(
            'https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.min.js',
            (error) => {
                if (error) console.error('RTL plugin load failed:', error)
            },
            true
        )
    }

    // Initialize map
    map.value = new maplibregl.Map({
        container: mapContainer.value,
        style: mapStyle.value,
        center: [51.389, 35.6892], // Tehran default
        zoom: 12,
        attributionControl: false,
    })

    // Map events
    map.value.on('load', () => {
        emitCurrentCenter()
        // Check location permission and move map if allowed
        checkPermission().then(() => {
            if (permissionStatus.value === 'granted') {
                flyToUserLocation()
            }
        })
    })

    map.value.on('movestart', () => {
        isDragging.value = true
    })

    map.value.on('moveend', () => {
        isDragging.value = false
        emitCurrentCenter()
    })

    map.value.on('click', (e) => {
        emit('map-click', { lat: e.lngLat.lat, lng: e.lngLat.lng })
    })
})

// Reactively update style when locale or theme changes
watch(mapStyle, (newStyle) => {
    if (map.value) map.value.setStyle(newStyle)
})

onUnmounted(() => {
    map.value?.remove()
})
</script>

<style scoped>
.map-wrapper {
    width: 100%;
    height: 200px;
    border-radius: 12px;
    overflow: hidden;
}
</style>