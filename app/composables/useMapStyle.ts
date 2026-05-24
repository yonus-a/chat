// composables/useMapStyle.ts
import { computed } from "vue";
import { useLocale } from "./useLocale";
import { useTheme } from "./useTheme";

// !!! Replace with your own MapTiler API key !!!
const MAPTILER_KEY = "2ng2wxgc2Nm19zQvLgg4";

export const useMapStyle = () => {
  const { locale } = useLocale();
  const { colorMode } = useTheme();

  const textFont = computed(() => {
    if (locale.value === "fa" || locale.value === "ar") {
      return ["IranYekanFaNum", "AppleColorEmoji", "sans-serif"];
    }
    return ["IranYekan", "AppleColorEmoji", "sans-serif"];
  });

  const mapStyle = computed(() => {
    const langKey = `name:${locale.value}`;
    const isDark = colorMode.value === "dark";

    const colors = {
      mainStreet: isDark ? "#8ba5c0" : "#476887",
      otherStreet: isDark ? "#d0d5db" : "#485c75",
      water: isDark ? "#8fdaef" : "#000c2c",
      parks: isDark ? "#d2f8e1" : "#0e3848",
      background: isDark ? "#f6f4f5" : "#162640",
      text: isDark ? "#333333" : "#dddddd",
      textHalo: isDark ? "#ffffff" : "#222222",
    };

    return {
      version: 8,
      glyphs: `https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=${MAPTILER_KEY}`,
      sources: {
        openmaptiles: {
          type: "vector",
          url: `https://api.maptiler.com/tiles/v3/tiles.json?key=${MAPTILER_KEY}`,
        },
      },
      layers: [
        // 1. Empty land (background)
        {
          id: "background",
          type: "background",
          paint: { "background-color": colors.background },
        },
        // 2. Parks, forests, green areas
        {
          id: "parks",
          type: "fill",
          source: "openmaptiles",
          "source-layer": "landuse",
          filter: ["in", "class", "park", "grass", "wood", "forest"],
          paint: { "fill-color": colors.parks },
        },
        // 3. Water
        {
          id: "water",
          type: "fill",
          source: "openmaptiles",
          "source-layer": "water",
          paint: { "fill-color": colors.water },
        },
        // 4. Main streets (solid, exact colour)
        {
          id: "road-main",
          type: "line",
          source: "openmaptiles",
          "source-layer": "transportation",
          filter: ["in", "class", "motorway", "trunk", "primary"],
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": colors.mainStreet,
            "line-width": {
              stops: [
                [12, 1.5],
                [15, 4],
                [18, 10],
              ],
            },
          },
        },
        // 5. Other streets
        {
          id: "road-other",
          type: "line",
          source: "openmaptiles",
          "source-layer": "transportation",
          filter: ["!in", "class", "motorway", "trunk", "primary"],
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": colors.otherStreet,
            "line-width": {
              stops: [
                [12, 0.8],
                [15, 2],
                [18, 6],
              ],
            },
          },
        },
        // 6. Street names (localised & RTL safe)
        {
          id: "road_labels",
          type: "symbol",
          source: "openmaptiles",
          "source-layer": "transportation_name",
          layout: {
            "symbol-placement": "line",
            "text-field": ["coalesce", ["get", langKey], ["get", "name"]],
            "text-size": 12,
            "text-font": textFont.value,
          },
          paint: {
            "text-color": colors.text,
            "text-halo-color": colors.textHalo,
            "text-halo-width": 2,
          },
        },
      ],
    };
  });

  return { mapStyle };
};
