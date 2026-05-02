export interface Story {
  id: number;
  date: Date | string;
  mediaUrl: string;
  thumbnail: string;
  isRead: boolean;
  type: "video" | "image";
  isLoading: boolean;
  isLoaded: boolean;
  localBlobUrl?: string;
}
