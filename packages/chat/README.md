# @behayand/chat

Standalone Vue 3 chat module extracted from the Behayand healthcare platform. Supports custom theming, data adapters for real API integration, and i18n.

## Installation

```bash
npm install @behayand/chat
```

## Quick Start

```vue
<template>
  <BehayandChat
    :adapter="chatAdapter"
    locale="fa"
    dir="rtl"
    @chat-selected="onChatSelected"
  />
</template>

<script setup lang="ts">
import { BehayandChat, createMockAdapter } from "@behayand/chat";
import "@behayand/chat/style.css";

// Use mock adapter for development
const chatAdapter = createMockAdapter(99);

function onChatSelected(id: number | null) {
  console.log("Selected chat:", id);
}
</script>
```

## Custom Data Adapter

Implement the `ChatDataAdapter` interface to connect to your real backend:

```typescript
import type { ChatDataAdapter } from "@behayand/chat";

const myAdapter: ChatDataAdapter = {
  getCurrentUserId: () => currentUser.id,

  async fetchConversations({ filter, page, pageSize, search }) {
    const res = await api.get("/conversations", { filter, page, pageSize, search });
    return { data: res.data, hasNextPage: res.hasMore };
  },

  async fetchMessages({ conversationId, page, pageSize }) {
    const res = await api.get(`/conversations/${conversationId}/messages`, { page, pageSize });
    return { data: res.data, hasNextPage: res.hasMore };
  },

  async sendMessage(messages) {
    const res = await api.post("/messages", { messages });
    return res.data;
  },

  async deleteMessages(ids) {
    await api.delete("/messages", { data: { ids } });
  },

  async editMessage(messageId, newText) {
    const res = await api.patch(`/messages/${messageId}`, { text: newText });
    return res.data;
  },

  async uploadFile(file, onProgress) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/upload", formData, {
      onUploadProgress: (e) => onProgress?.(Math.round((e.loaded / e.total) * 100)),
    });
    return res.data.url;
  },

  async markAsRead(conversationId) {
    await api.post(`/conversations/${conversationId}/read`);
  },
};
```

## Theming

Override CSS variables to customize the appearance:

```typescript
import { setChatTheme } from "@behayand/chat";

setChatTheme({
  "chat-primary": "#ff6600",
  "chat-bubble-mine": "#ff6600",
  "chat-bg": "#1a1a2e",
  "chat-text": "#eaeaea",
  "chat-font-family": "Vazirmatn, sans-serif",
});
```

Or override in CSS:

```css
:root {
  --chat-primary: #your-color;
  --chat-bg: #your-bg;
  --chat-bubble-mine: #your-bubble-color;
}
```

## i18n

Register custom locale messages:

```typescript
import { registerChatLocale, setChatLocale } from "@behayand/chat";

registerChatLocale("en", {
  chat: {
    title: "Messages",
    // ... your translations
  },
});

setChatLocale("en");
```

## Individual Components

You can also use individual components for custom layouts:

```vue
<template>
  <div class="my-layout">
    <ChatList :active-chat-id="activeChatId" @select-chat="onSelect" />
    <ChatView
      v-if="activeChatId"
      :chat-id="activeChatId"
      :current-user-id="userId"
      :messages="messages"
    />
  </div>
</template>

<script setup>
import { ChatList, ChatView } from "@behayand/chat";
</script>
```

## Exports

### Components
- `BehayandChat` — Full chat widget (sidebar + messages)
- `ChatView` — Single chat conversation view
- `ChatList` — Contact/conversation list
- `ChatMessages` — Message list display
- `ChatInput` — Message input with emoji/attachments
- `ChatPageBar` — Chat header bar
- `ChatProfileOverview` — Contact profile sidebar
- `ChatBubble` — Individual message bubble

### Stores (Pinia)
- `useChatStore` — Conversation management
- `useChatActionStore` — Message actions (send, edit, delete, select)

### Utilities
- `setChatTheme()` / `resetChatTheme()` — Theme management
- `setChatLocale()` / `registerChatLocale()` — i18n
- `createMockAdapter()` — Mock data adapter for development
- `formatCurrency()`, `formatBytes()`, `formatDuration()` — Formatters
- `parseEmojiArray()` — Emoji text parsing

### Types
- `ChatDataAdapter` — Interface for data connectivity
- `Message`, `Contact`, `ExtendedMessage` — Core data types
- All chat-related TypeScript interfaces

## Peer Dependencies

- `vue` ^3.5.0
- `pinia` ^2.0.0
