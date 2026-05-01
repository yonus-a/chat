import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Story } from "~/types/story";

export const useStoriesStore = defineStore("stories", () => {
  const isStoriesOpen = ref(false);
  const stories = ref<Story[]>([
    {
      id: 1,
      thumbnail: "",
      date: new Date(),
      mediaUrl: "",
      isRead: false,
      type: "image",
    },
    {
      id: 1,
      thumbnail: "",
      date: new Date(),
      mediaUrl: "",
      isRead: false,
      type: "video",
    },
    {
      id: 1,
      thumbnail: "",
      date: new Date(),
      mediaUrl: "",
      isRead: false,
      type: "image",
    },
    {
      id: 1,
      thumbnail: "",
      date: new Date(),
      mediaUrl: "",
      isRead: true,
      type: "video",
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
    isStoriesOpen,
  };
});
