import { computed } from "vue";
import { useI18n } from "vue-i18n";

export const useMapStyle = () => {
  const { locale } = useI18n();

  // Central place to manage your MapTiler Key
  // Ideally, put this in your runtimeConfig public keys
  const apiKey = "WbVHbHBFKakXg5zU8MsC";

  const mapStyle = computed(() => {
    // Dynamic language key for MapTiler (e.g., "name:fa", "name:en")
    const langKey = `name:${locale.value}`;

    return {
      version: 8,
      // Fonts are required for text labels
      glyphs: `https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=${apiKey}`,
      sources: {
        openmaptiles: {
          type: "vector",
          url: `https://api.maptiler.com/tiles/v3/tiles.json?key=${apiKey}`,
        },
      },
      layers: [
        // 1. Background (Grayish #dcdcdc)
        {
          id: "background",
          type: "background",
          paint: { "background-color": "#f2ede2" },
        },
        // 2. Jungles & Forests (#b6eed0)
        {
          id: "parks",
          type: "fill",
          source: "openmaptiles",
          "source-layer": "landuse",
          filter: ["in", "class", "park", "grass", "wood", "forest"],
          paint: { "fill-color": "#b6eed0" },
        },
        // 3. Sea & Water (#80d3e9)
        {
          id: "water",
          type: "fill",
          source: "openmaptiles",
          "source-layer": "water",
          paint: { "fill-color": "#80d3e9" },
        },
        // 4. Roads (#c8d3dc)
        {
          id: "roads",
          type: "line",
          source: "openmaptiles",
          "source-layer": "transportation",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": "#c8d3dc",
            "line-width": {
              stops: [, ,],
            },
          },
        },
        // 5. Buildings (#e3e4e8)
        {
          id: "buildings",
          type: "fill",
          source: "openmaptiles",
          "source-layer": "building",
          paint: { "fill-color": "#e3e4e8", "fill-opacity": 0.8 },
        },
        // 7. Street Names (Localized)
        {
          id: "road_labels",
          type: "symbol",
          source: "openmaptiles",
          "source-layer": "transportation_name",
          layout: {
            "symbol-placement": "line",
            // Try language specific name, fallback to local name
            "text-field": ["coalesce", ["get", langKey], ["get", "name"]],
            "text-size": 12,
            "text-font": ["Noto Sans Arabic Regular"],
          },
          paint: {
            "text-color": "#666666",
            "text-halo-color": "#ffffff",
            "text-halo-width": 2,
          },
        },
      ],
    };
  });

  const streetStyle = computed(() => {
    const langKey = `name:${locale.value}`;

    return {
      version: 8,
      glyphs: `https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=${apiKey}`,
      sources: {
        openmaptiles: {
          type: "vector",
          url: `https://api.maptiler.com/tiles/v3/tiles.json?key=${apiKey}`,
        },
      },
      layers: [
        {
          id: "background",
          type: "background",
          paint: { "background-color": "#dcdcdc" },
        },
        {
          id: "parks",
          type: "fill",
          source: "openmaptiles",
          "source-layer": "landuse",
          filter: [
            "in",
            "class",
            "park",
            "grass",
            "cemetery",
            "wood",
            "pitch",
            "sand",
          ],
          paint: { "fill-color": "#acd47c", "fill-opacity": 1 },
        },
        {
          id: "landcover",
          type: "fill",
          source: "openmaptiles",
          "source-layer": "landcover",
          filter: ["in", "class", "grass", "wood"],
          paint: { "fill-color": "#acd47c", "fill-opacity": 1 },
        },
        {
          id: "water",
          type: "fill",
          source: "openmaptiles",
          "source-layer": "water",
          paint: { "fill-color": "#aadaff" },
        },
        // --- MODIFIED ROAD CASING ---
        {
          id: "roads-casing",
          type: "line",
          source: "openmaptiles",
          "source-layer": "transportation",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": "#c8c8c8",
            "line-width": {
              stops: [
                [12, 1.2],
                [15, 3],
                [18, 10],
              ],
            },
          },
        },
        // --- MODIFIED ROAD FILL ---
        {
          id: "roads-fill",
          type: "line",
          source: "openmaptiles",
          "source-layer": "transportation",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": "#f2f2f2",
            "line-width": {
              stops: [
                [12, 0.8],
                [15, 2],
                [18, 8],
              ],
            },
          },
        },
        {
          id: "buildings",
          type: "fill",
          source: "openmaptiles",
          "source-layer": "building",
          paint: { "fill-color": "#e0e0e0", "fill-opacity": 0.6 },
        },
        {
          id: "road_labels",
          type: "symbol",
          source: "openmaptiles",
          "source-layer": "transportation_name",
          layout: {
            "symbol-placement": "line",
            "text-field": ["coalesce", ["get", langKey], ["get", "name"]],
            "text-size": 12,
            "text-font": ["Noto Sans Arabic Regular"],
          },
          paint: {
            "text-color": "#666666",
            "text-halo-color": "#ffffff",
            "text-halo-width": 2,
          },
        },
      ],
    };
  });

  return { mapStyle, streetStyle };
};
