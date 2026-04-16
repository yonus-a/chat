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
      loading: true,
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
      cat.loading = false;
    }
  };

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

  return {
    categories,
    fetchCategoryData,
    getTrend,
    latestValue,
    level,
    hasData,
  };
});
