import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Story } from "~/types/story";

export const useStoriesStore = defineStore("stories", () => {
  const stories = ref<Story[]>([
    {
      id: 1,
      thumbnail: "",
      date: new Date(),
      mediaUrl: "",
      isRead: false,
    },
    {
      id: 1,
      thumbnail: "",
      date: new Date(),
      mediaUrl: "",
      isRead: false,
    },
    {
      id: 1,
      thumbnail: "",
      date: new Date(),
      mediaUrl: "",
      isRead: false,
    },
    {
      id: 1,
      thumbnail: "",
      date: new Date(),
      mediaUrl: "",
      isRead: true,
    },
  ]);

  const isLoadingStories = ref(false);

  const fetchStories = async () => {
    if (isLoadingStories.value) return;
    isLoadingStories.value = true;
    try {
    } catch (error) {
    } finally {
      isLoadingStories.value = false;
    }
  };

  return {
    fetchStories,
    isLoadingStories,
    stories,
  };
});
