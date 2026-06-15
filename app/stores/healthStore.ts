import { defineStore } from "pinia";
import { ref } from "vue";

export type HealthCategory = "mental" | "physical" | "social" | "all";

export interface CategoryData {
  chartData: number[];
  min: number;
  max: number;
  currentValue: number;
  loading: boolean;
  isLoaded: boolean;
}

export const useHealthStore = defineStore("health", () => {
  const categories = ref<Record<HealthCategory, CategoryData>>({
    mental: {
      chartData: [20, 50, 30, 60, 70, 50, 100],
      min: 0,
      max: 100,
      currentValue: 0,
      loading: true,
      isLoaded: false,
    },
    physical: {
      chartData: [0, 100, 20, 30, 40, 70, 40],
      min: 0,
      max: 100,
      currentValue: 0,
      loading: true,
      isLoaded: false,
    },
    social: {
      chartData: [100, 50, 70, 30, 20, 70],
      min: 0,
      max: 100,
      currentValue: 0,
      loading: true,
      isLoaded: false,
    },
    all: {
      chartData: [29, 50, 70, 30, 0],
      min: 0,
      max: 100,
      currentValue: 0,
      loading: false,
      isLoaded: false,
    },
  });

  const level = ref(1);

  const fetchCategoryData = async (type: HealthCategory) => {
    const cat = categories.value[type];
    if (cat.isLoaded) return;

    cat.loading = true;
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mocks: Record<HealthCategory, Partial<CategoryData>> = {
        mental: {
          chartData: [20, 50, 30, 60, 70, 50, 100],
          min: 0,
          max: 100,
          currentValue: 45,
        },
        physical: {
          chartData: [0, 100, 20, 30, 40, 70, 40],
          min: 0,
          max: 100,
          currentValue: 88,
        },
        social: {
          chartData: [29, 50, 70, 30, 40],
          min: 0,
          max: 100,
          currentValue: 75,
        },
        all: {
          chartData: [40, 100, 20, 30, 40, 70, 50],
          min: 0,
          max: 100,
          currentValue: 70,
        },
      };

      Object.assign(cat, mocks[type], { isLoaded: true });
    } finally {
      categories.value[type].loading = false;
    }
  };

  const overallScore = computed(() => {
    const keys: HealthCategory[] = ["mental", "physical", "social"];

    // Filter categories that actually have data
    const activeScores = keys
      .map((key) => {
        const cat = categories.value[key];
        if (cat.chartData.length === 0) return null;

        const current = cat.chartData[cat.chartData.length - 1];
        const range = cat.max - cat.min;
        return range === 0 ? 0 : ((current - cat.min) / range) * 100;
      })
      .filter((s) => s !== null) as number[];

    if (activeScores.length === 0) return 0;

    const sum = activeScores.reduce((a, b) => a + b, 0);
    return sum / activeScores.length;
  });

  const overallLevel = computed(() => {
    const score = overallScore.value;
    const rawLevel = (score / 100) * 5;
    return Math.max(1, Math.min(5, Math.ceil(rawLevel)));
  });

  /**
   * The Keyword for the overall health state
   */
  const overallStatus = computed(() => {
    const level = overallLevel.value;
    if (level <= 1) return "bad";
    if (level <= 3) return "medium";
    if (level <= 4) return "good";
    return "great";
  });

  const getTrend = (type: HealthCategory) => {
    const data = categories.value[type].chartData;

    // Safety check to prevent NaN if data is missing or array is empty
    if (!data || data.length < 2) return 0;

    const start = data[0];
    const end = data[data.length - 1];

    if (start === 0) return 0;

    const change = Math.round(((end - start) / start) * 100);

    return Math.abs(change);
  };

  const latestValue = (type: HealthCategory) => {
    const data = categories.value[type].chartData;
    return data[data.length - 1];
  };

  const hasData = computed(() => categories.value.all.chartData.length !== 0);

  const isGlobalLoading = computed(() => {
    return (
      categories.value.mental.loading ||
      categories.value.physical.loading ||
      categories.value.social.loading
    );
  });

  return {
    categories,
    fetchCategoryData,
    getTrend,
    isGlobalLoading,
    overallStatus,
    latestValue,
    level,
    hasData,
  };
});
