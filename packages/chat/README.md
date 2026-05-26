# @behayand/chat

Reusable chat UI module with a pluggable data adapter pattern. Connect to any backend by implementing the `ChatDataAdapter` interface.

## Installation

```bash
npm install @behayand/chat
```

## Quick Start

```vue
<script setup lang="ts">
import { provideChatAdapter, MockChatAdapter } from '@behayand/chat'

// Use the mock adapter for development
provideChatAdapter(new MockChatAdapter())
</script>

<template>
  <BehayandChat />
</template>
```

## Custom Data Adapter

Implement the `ChatDataAdapter` interface to connect to your real backend:

```ts
import type { ChatDataAdapter, FilterKeys, Message, Contact, PaginatedContacts, PaginatedMessages, CurrentUser } from '@behayand/chat'

export class MyApiAdapter implements ChatDataAdapter {
  getCurrentUser(): CurrentUser {
    return { id: 1, name: 'John', lastName: 'Doe' }
  }

  async fetchConversations(
    filter: FilterKeys,
    page: number,
    pageSize: number,
    search?: string
  ): Promise<PaginatedContacts> {
    const response = await fetch(`/api/conversations?filter=${filter}&page=${page}&pageSize=${pageSize}&search=${search || ''}`)
    return response.json()
  }

  async fetchMessages(
    conversationId: number,
    page: number,
    pageSize: number
  ): Promise<PaginatedMessages> {
    const response = await fetch(`/api/conversations/${conversationId}/messages?page=${page}&pageSize=${pageSize}`)
    return response.json()
  }

  async sendMessages(messages: Message[]): Promise<Message[]> {
    const response = await fetch('/api/messages', {
      method: 'POST',
      body: JSON.stringify(messages),
      headers: { 'Content-Type': 'application/json' }
    })
    return response.json()
  }

  async editMessage(messageId: number, newText: string): Promise<Message> {
    const response = await fetch(`/api/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify({ text: newText }),
      headers: { 'Content-Type': 'application/json' }
    })
    return response.json()
  }

  async deleteMessages(messageIds: number[]): Promise<void> {
    await fetch('/api/messages', {
      method: 'DELETE',
      body: JSON.stringify({ ids: messageIds }),
      headers: { 'Content-Type': 'application/json' }
    })
  }

  async markAsRead(conversationId: number): Promise<void> {
    await fetch(`/api/conversations/${conversationId}/read`, { method: 'POST' })
  }

  async getContactById(contactId: number): Promise<Contact | null> {
    const response = await fetch(`/api/contacts/${contactId}`)
    if (!response.ok) return null
    return response.json()
  }

  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)

    // Use XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', '/api/upload')

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      }

      xhr.onload = () => resolve(JSON.parse(xhr.responseText).url)
      xhr.onerror = () => reject(new Error('Upload failed'))
      xhr.send(formData)
    })
  }
}
```

Then provide it in your app:

```vue
<script setup lang="ts">
import { provideChatAdapter } from '@behayand/chat'
import { MyApiAdapter } from './adapters/MyApiAdapter'

provideChatAdapter(new MyApiAdapter())
</script>

<template>
  <BehayandChat />
</template>
```

## API Reference

### `ChatDataAdapter` Interface

| Method | Description |
|--------|-------------|
| `getCurrentUser()` | Returns the current authenticated user |
| `fetchConversations(filter, page, pageSize, search?)` | Fetch paginated conversation list |
| `fetchMessages(conversationId, page, pageSize)` | Fetch messages for a conversation |
| `sendMessages(messages)` | Send messages to a conversation |
| `editMessage(messageId, newText)` | Edit a message |
| `deleteMessages(messageIds)` | Delete messages |
| `markAsRead(conversationId)` | Mark a conversation as read |
| `getContactById(contactId)` | Get contact details |
| `uploadFile(file, onProgress?)` | (Optional) Upload a file |

### Helper Functions

| Function | Description |
|----------|-------------|
| `provideChatAdapter(adapter)` | Provide adapter to component tree (call in parent) |
| `useChatAdapter()` | Inject adapter (used internally by chat components) |

### Types

All chat-related types are exported from the package:

```ts
import type {
  Message,
  Contact,
  FilterKeys,
  CurrentUser,
  PaginatedContacts,
  PaginatedMessages,
  ChatDataAdapter,
} from '@behayand/chat'
```
