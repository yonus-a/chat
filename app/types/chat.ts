import type { Service } from "./service";

export type MessageType = "text" | "image" | "file" | "voice" | "video";
export type status = "pending" | "approved" | "rejected" | "expired";

export interface Message {
  id: number;
  conversationId: number;
  date: Date;
  type: MessageType;
  text?: string;
  imageUrl?: string[];
  fileUrl?: string;
  voiceUrl?: string;
  videoUrl?: string;
  isEdited: boolean;
  senderId: number;
  isSent: boolean;
  isRead: boolean;
  repliedTo: Message;
  request?: Request;
}

export interface Contact {
  id: number;
  name: string;
  lastName: string;
  isOnline: boolean;
  lastSeen: Date;
  imageUrl: string;
  nationalCode?: string;
  phoneNumber: string;
  isActive: boolean;
  birthDate: Date;
  lastMessage?: Message;
  unreadCount?: number;
  serviceType: "video-call" | "voice-call" | "chat";
}

export type FilterKeys = "" | "online" | "ended" | "active";

export interface ChatFilter {
  key: FilterKeys;
  label: string;
}

export interface ExtendedMessage extends Message {
  prevMessage?: Message;
  nextMessage?: Message;
  isFirstInDate: boolean;
  contact?: Contact;
}

export interface Request {
  id: number;
  type: "personal-info" | "add-person";
  request: AccessRequest | Service;
}

export interface AccessRequest {
  id: number;
  date: Date;
  status: status;
}
