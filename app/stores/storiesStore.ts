// stores/stories.ts
import { defineStore } from "pinia";
import { ref } from "vue";
import type { Story } from "~/types/story";

export const useStoriesStore = defineStore("stories", () => {
  const hoursToKeep = 24; // Parameter for storage persistence
  const isStoriesOpen = ref(false);
  const activeStoryId = ref<number | null>(null);
  const isLoadingStories = ref(false);
  const stories = ref<Story[]>([]);

  /**
   * 1. CLEANUP & SYNC
   * Deletes metadata older than 24h and applies 'isRead' status to loaded stories.
   */
  const syncWithStorage = () => {
    const storedData = localStorage.getItem("app_stories_meta");
    const metaMap = storedData ? JSON.parse(storedData) : {};
    const now = new Date().getTime();
    const expiryMs = hoursToKeep * 60 * 60 * 1000;

    const updatedMeta: Record<number, { isRead: boolean; timestamp: number }> =
      {};

    // Get valid IDs from the currently fetched stories to cross-reference
    const validIds = new Set(stories.value.map((s) => s.id));

    // Clean up expired entries OR entries that no longer exist in the backend
    Object.keys(metaMap).forEach((idStr) => {
      const id = Number(idStr);
      const item = metaMap[idStr];
      if (now - item.timestamp < expiryMs && validIds.has(id)) {
        updatedMeta[id] = item;
      }
    });

    // Apply isRead status from storage to our reactive state
    stories.value.forEach((story) => {
      if (updatedMeta[story.id]) {
        story.isRead = updatedMeta[story.id].isRead;
      }
    });

    localStorage.setItem("app_stories_meta", JSON.stringify(updatedMeta));
  };

  /**
   * 2. PERSISTENCE
   * Marks a story as read in state and localStorage.
   */
  const markAsRead = (id: number) => {
    const story = stories.value.find((s) => s.id === id);
    if (story && !story.isRead) {
      story.isRead = true;

      const storedData = localStorage.getItem("app_stories_meta");
      const metaMap = storedData ? JSON.parse(storedData) : {};

      metaMap[id] = {
        isRead: true,
        timestamp: new Date(story.date).getTime(),
      };

      localStorage.setItem("app_stories_meta", JSON.stringify(metaMap));
    }
  };

  /**
   * 3. PRELOADING
   * Fetches media files and converts them to local Blob URLs for instant playback.
   */
  const preloadStories = async () => {
    await Promise.all(
      stories.value.map(async (story) => {
        if (story.isLoaded || story.isLoading) return;

        story.isLoading = true;
        try {
          const response = await fetch(story.mediaUrl);
          if (response.ok) {
            const blob = await response.blob();
            story.localBlobUrl = URL.createObjectURL(blob);
            story.isLoaded = true;
          }
        } catch (error) {
          console.error(`Failed to preload story ${story.id}:`, error);
          story.isLoaded = false;
        } finally {
          story.isLoading = false;
        }
      }),
    );
  };

  /**
   * 4. FETCHING (Backend Simulation)
   */
  const fetchStories = async () => {
    if (isLoadingStories.value) return;
    isLoadingStories.value = true;

    try {
      // Simulated API call
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const mockData: Story[] = [
        {
          id: 501,
          thumbnail: "https://picsum.photos/id/10/200/300",
          date: new Date(),
          mediaUrl: "https://picsum.photos/id/10/1080/1920",
          isRead: false,
          type: "image",
          isLoading: false,
          isLoaded: false,
          localBlobUrl: "",
        },
        {
          id: 502,
          thumbnail: "https://picsum.photos/id/20/200/300",
          date: new Date(),
          mediaUrl: "https://vjs.zencdn.net/v/oceans.mp4",
          isRead: false,
          type: "video",
          isLoading: false,
          isLoaded: false,
          localBlobUrl: "",
        },
        {
          id: 503,
          thumbnail: "https://picsum.photos/id/30/200/300",
          date: new Date(),
          mediaUrl: "https://picsum.photos/id/30/1080/1920",
          isRead: false,
          type: "image",
          isLoading: false,
          isLoaded: false,
          localBlobUrl: "",
        },
        {
          id: 504,
          thumbnail: "https://picsum.photos/id/40/200/300",
          date: new Date(),
          mediaUrl: "https://vjs.zencdn.net/v/oceans.mp4",
          isRead: false,
          type: "video",
          isLoading: false,
          isLoaded: false,
          localBlobUrl: "",
        },
      ];

      stories.value = mockData;

      // After fetching, immediately sync metadata and start preloading
      syncWithStorage();
      preloadStories();
    } catch (error) {
      console.error("Error fetching stories:", error);
    } finally {
      isLoadingStories.value = false;
    }
  };

  const openStory = (id: number) => {
    activeStoryId.value = id;
    isStoriesOpen.value = true;
  };

  return {
    stories,
    isStoriesOpen,
    activeStoryId,
    isLoadingStories,
    fetchStories,
    openStory,
    markAsRead,
    hoursToKeep,
  };
});
