# @behayand/chat

A reusable Vue 3 chat component library. Use it in any Vue 3 project by implementing the `ChatDataAdapter` interface to connect your own data source.

## Installation

```bash
npm install @behayand/chat
```

## Quick Start

```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createBehayandChat, MockChatAdapter } from '@behayand/chat'
import '@behayand/chat/style.css'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.use(createBehayandChat({
  adapter: new MockChatAdapter(),
  config: { currentUserId: 1, direction: 'rtl' }
}))
app.mount('#app')
```

## Usage in a Component

```vue
<template>
  <BehayandChat
    :adapter="myAdapter"
    :config="{ currentUserId: 1, direction: 'rtl' }"
    @conversation-selected="onSelect"
    @message-sent="onSent"
    @error="onError"
  />
</template>

<script setup>
import { BehayandChat } from '@behayand/chat'
import '@behayand/chat/style.css'
import { MyCustomAdapter } from './my-adapter'

const myAdapter = new MyCustomAdapter()

const onSelect = (id) => console.log('Selected:', id)
const onSent = (msg) => console.log('Sent:', msg)
const onError = (err) => console.error(err)
</script>
```

## Implementing a Custom Adapter

```ts
import type { ChatDataAdapter } from '@behayand/chat'

export class MyApiAdapter implements ChatDataAdapter {
  async fetchContacts(params) {
    const res = await fetch(`/api/contacts?page=${params.page}`)
    return res.json()
  }

  async fetchMessages(params) {
    const res = await fetch(`/api/messages/${params.conversationId}?page=${params.page}`)
    return res.json()
  }

  async sendMessage(payload) {
    const res = await fetch('/api/messages', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    return res.json()
  }

  async editMessage(params) {
    const res = await fetch(`/api/messages/${params.messageId}`, {
      method: 'PATCH',
      body: JSON.stringify({ text: params.text })
    })
    return res.json()
  }

  async deleteMessages(ids) {
    await fetch('/api/messages', {
      method: 'DELETE',
      body: JSON.stringify({ ids })
    })
  }

  async markAsRead(conversationId) {
    await fetch(`/api/conversations/${conversationId}/read`, { method: 'POST' })
  }
}
```

## Slots

The `BehayandChat` component provides several slots for customization:

- `page-bar` - Custom header/toolbar for the conversation
- `messages` - Custom message rendering
- `input` - Custom message input area
- `contact-list` - Custom contact list rendering
- `empty-state` - Content shown when no conversation is selected

## Configuration

| Prop | Type | Description |
|------|------|-------------|
| `adapter` | `ChatDataAdapter` | Data adapter instance |
| `config` | `ChatConfig` | Configuration object |

### ChatConfig

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `currentUserId` | `number \| string` | required | The current user's ID |
| `direction` | `'rtl' \| 'ltr'` | `'ltr'` | Text direction |
| `locale` | `string` | - | Locale identifier |
| `enableCalls` | `boolean` | `false` | Enable call features |
| `enableMedicFeatures` | `boolean` | `false` | Enable medical features |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `conversation-selected` | `number \| string` | Emitted when a conversation is selected |
| `message-sent` | `ChatMessage` | Emitted after a message is sent |
| `error` | `Error` | Emitted on any error |
