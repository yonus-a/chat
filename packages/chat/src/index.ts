import "./theme/variables.css";

export { default as BehayandChat } from "./components/BehayandChat.vue";
export { default as ChatView } from "./components/chat/ChatView.vue";
export { default as ChatList } from "./components/chat/contact/ChatList.vue";
export { default as ChatMessages } from "./components/chat/ChatMessages.vue";
export { default as ChatInput } from "./components/chat/ChatInput.vue";
export { default as ChatPageBar } from "./components/chat/ChatPageBar.vue";
export { default as ChatProfileOverview } from "./components/chat/ChatProfileOverview.vue";
export { default as ChatBubble } from "./components/chat/ChatBubble.vue";

export { useChatStore } from "./stores/chatStore";
export { useChatActionStore } from "./stores/chatActionStore";

export type { ChatDataAdapter } from "./adapter/types";
export { provideChatAdapter, useChatAdapter, CHAT_ADAPTER_KEY } from "./adapter/useChatAdapter";
export { createMockAdapter } from "./adapter/mockAdapter";

export { setChatTheme, resetChatTheme } from "./theme";

export { setChatLocale, registerChatLocale, getChatLocale, t as chatT } from "./i18n";
export type { ChatLocaleMessages } from "./i18n";

export type {
  Message,
  MessageType,
  MessageStatus,
  Contact,
  ExtendedMessage,
  FilterKeys,
  ChatFilter,
  Request,
  AccessRequest,
  ServiceRequest,
  RequestProvider,
  Service,
  Provider,
  Invoice,
  Fellowship,
  UserRoleKey,
  UploadProgress,
} from "./types";

export { useChatRecording } from "./composables/useChatRecording";
export { useDate } from "./composables/useDate";
export { useAppToast } from "./composables/useAppToast";

export {
  formatCurrency,
  toPersianNumbers,
  replaceDigitsWithPersian,
  replaceDigitsByLocale,
  formatBytes,
  formatPhoneNumber,
  formatCountdown,
  formatDuration,
} from "./utils/format";
export { parseEmojiArray } from "./utils/emojiParser";
export type { EmojiSegment } from "./utils/emojiParser";
