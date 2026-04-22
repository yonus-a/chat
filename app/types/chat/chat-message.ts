export interface Message {
  id: number;
  date: Date;
  imageUrl?: string[];
  fileUrl?: string[];
  isEditted: string;
  voiceUrl: string;
  text: string;
  senderId: number;
  isSent: boolean;
  isRead: boolean;
}
