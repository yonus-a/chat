import type { Message } from "~/types/chat";

export interface UploadProgressEvent {
  uploaded: number;
  total: number;
  progress: number;
}

export interface SendMessageOptions {
  onProgress?: (e: UploadProgressEvent) => void;
}

export type AccessDecision = "approved" | "rejected";

export interface ChatActionAdapter {
  sendMessage(msg: Message, opts?: SendMessageOptions): Promise<Message>;

  editMessage(id: number, text: string): Promise<Message>;

  deleteMessages(ids: number[]): Promise<void>;

  respondToAccessRequest(
    messageId: number,
    decision: AccessDecision,
  ): Promise<void>;
}
