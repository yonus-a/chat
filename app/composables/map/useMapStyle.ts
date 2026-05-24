// composables/useMapStyle.ts
import { computed } from 'vue'
import { useI18n } from '#imports'

export function useMapStyle(isDark: Ref<boolean>) {
  const { locale } = useI18n()
  const apiKey = 'WbVHbHBFKakXg5zU8MsC'   // your existing MapTiler key

  const colors = computed(() => isDark.value ? {
    background: '#1e1e2e',
    mainStreet: '#8ba5c0',
    otherStreet: '#d0d5db',
    water: '#8fdaef',
    park: '#d2f8e1',
    text: '#ffffff',
    halo: '#000000',
  } : {
    background: '#f8f9fa',
    mainStreet: '#476887',
    otherStreet: '#485c75',
    water: '#000c2c',
    park: '#0e3848',
    text: '#000000',
    halo: '#ffffff',
  })

  const mapStyle = computed(() => {
    const c = colors.value
    const langKey = `name:${locale.value}`

    return {
      version: 8,
      glyphs: `https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=${apiKey}`,
      sources: {
        openmaptiles: {
          type: 'vector',
          url: `https://api.maptiler.com/tiles/v3/tiles.json?key=${apiKey}`,
        },
      },
      layers: [
        {
          id: 'background',
          type: 'background',
          paint: { 'background-color': c.background },
        },
        {
          id: 'water',
          type: 'fill',
          source: 'openmaptiles',
          'source-layer': 'water',
          paint: { 'fill-color': c.water },
        },
        {
          id: 'parks',
          type: 'fill',
          source: 'openmaptiles',
          'source-layer': 'landuse',
          filter: ['in', 'class', 'park', 'forest', 'grass', 'garden'],
          paint: { 'fill-color': c.park, 'fill-opacity': 0.8 },
        },
        {
          id: 'road-main',
          type: 'line',
          source: 'openmaptiles',
          'source-layer': 'transportation',
          filter: ['match', ['get', 'class'], ['motorway', 'trunk', 'primary'], true, false],
          paint: {
            'line-color': c.mainStreet,
            'line-width': ['interpolate', ['linear'], ['zoom'], 5, 1, 15, 5],
          },
          layout: { 'line-join': 'round', 'line-cap': 'round' },
        },
        {
          id: 'road-other',
          type: 'line',
          source: 'openmaptiles',
          'source-layer': 'transportation',
          filter: ['match', ['get', 'class'], ['secondary', 'tertiary', 'residential', 'living_street', 'service'], true, false],
          paint: {
            'line-color': c.otherStreet,
            'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.5, 15, 2.5],
          },
          layout: { 'line-join': 'round', 'line-cap': 'round' },
        },
        {
          id: 'road-labels',
          type: 'symbol',
          source: 'openmaptiles',
          'source-layer': 'transportation_name',
          filter: ['has', 'name'],
          layout: {
            'symbol-placement': 'line',
            'text-field': ['coalesce', ['get', langKey], ['get', 'name']],
            'text-font': ['Noto Naskh Arabic', 'Noto Sans Arabic', 'Noto Sans Regular'],
            'text-size': 12,
          },
          paint: {
            'text-color': c.text,
            'text-halo-color': c.halo,
            'text-halo-width': 1.5,
          },
        },
      ],
    }
  })

  return mapStyle
}