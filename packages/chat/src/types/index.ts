export type MessageType = "text" | "image" | "file" | "voice" | "video";
export type MessageStatus = "pending" | "sent" | "delivered" | "read" | "failed";

export interface ChatMessage {
  id: number | string;
  conversationId: number | string;
  date: Date;
  type: MessageType;
  text?: string;
  imageUrl?: string[];
  fileUrl?: string;
  voiceUrl?: string;
  videoUrl?: string;
  isEdited: boolean;
  senderId: number | string;
  isSent: boolean;
  isRead: boolean;
  repliedTo?: ChatMessage;
}

export interface ChatContact {
  id: number | string;
  name: string;
  lastName: string;
  isOnline: boolean;
  lastSeen: Date;
  imageUrl: string;
  isActive: boolean;
  birthDate?: Date;
  lastMessage?: ChatMessage;
  unreadCount?: number;
  phoneNumber?: string;
  nationalCode?: string;
  serviceType?: "video-call" | "voice-call" | "chat";
}

export type FilterKeys = "" | "online" | "ended" | "active";

export interface ChatFilter {
  key: FilterKeys;
  label: string;
}

export interface ExtendedChatMessage extends ChatMessage {
  prevMessage?: ChatMessage;
  nextMessage?: ChatMessage;
  isFirstInDate: boolean;
  contact?: ChatContact;
}

export interface PaginatedResult<T> {
  data: T[];
  hasNextPage: boolean;
  total?: number;
}

export interface SendMessagePayload {
  conversationId: number | string;
  type: MessageType;
  text?: string;
  file?: File;
  repliedTo?: ChatMessage;
}

export interface ChatConfig {
  /** Direction: rtl or ltr */
  direction?: "rtl" | "ltr";
  /** Locale key for i18n */
  locale?: string;
  /** Custom translations object */
  translations?: Record<string, string>;
  /** Whether to show call features */
  enableCalls?: boolean;
  /** Whether to show medic-specific features */
  enableMedicFeatures?: boolean;
  /** Current user ID */
  currentUserId: number | string;
}
