// Message types
export type MessageType = "text" | "image" | "file" | "voice" | "video";
export type MessageStatus = "pending" | "approved" | "rejected" | "expired";

// Simplified standalone types (originally from service.ts, invoice.ts, profile.ts)
export type UserRoleKey =
  | "doctor"
  | "nurse"
  | "patient"
  | "admin"
  | "pharmacist"
  | "specialist";

export interface Fellowship {
  id: number;
  label: string;
}

export interface Service {
  id: number;
  label: string;
  icon?: string;
  fellowships?: Fellowship[];
  expertiseLevel?: string;
}

export interface Provider {
  id: number;
  name: string;
  lastName: string;
  imageUrl: string;
  fellowship?: Fellowship;
  price?: number;
}

export interface Invoice {
  id: number;
  amount: number;
  status: "pending" | "paid" | "cancelled";
  date: Date;
}

// Chat core types
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
  repliedTo: Message | null;
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
  phoneNumber?: string;
  isActive: boolean;
  birthDate: Date;
  lastMessage?: Message;
  unreadCount?: number;
  serviceType?: "video-call" | "voice-call" | "chat";
  userType?: UserRoleKey[];
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
  request: AccessRequest | ServiceRequest;
}

export interface AccessRequest {
  id: number;
  date: Date;
  status: MessageStatus;
}

export interface RequestProvider extends Provider {
  status: "pending" | "approved" | "payment" | "rejected" | "expired";
}

export interface ServiceRequest extends Service {
  status?:
    | "searching"
    | "pending"
    | "approved"
    | "payment"
    | "rejected"
    | "expired";
  provider?: RequestProvider[];
  service?: Service;
  invoice?: Invoice;
}

// Upload progress tracking
export interface UploadProgress {
  progress: number;
  uploaded: number;
  total: number;
}
