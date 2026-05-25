# Behayand Chat - Standalone Vite App

This is a standalone Vite + Vue 3 project containing the chat pages extracted from the main Nuxt application.

## Pages

- **ChatPage** (`/dashboard/chat`) - Chat wrapper with contact list and message area
- **ChatIdPage** (`/dashboard/chat/:id`) - Individual chat conversation view with messaging, calls, and profile

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Stack

- **Vue 3** - UI framework
- **Vue Router** - Client-side routing
- **Pinia** - State management
- **Vue I18n** - Internationalization (Persian/Farsi)
- **Tailwind CSS v4** - Utility-first CSS
- **Phosphor Icons** - Icon library
- **VueUse** - Composition utilities

## Structure

```
src/
├── pages/           # Route page components (chat.vue, chat/[...id].vue equivalent)
├── components/      # All UI components (chat, call, global, general)
├── stores/          # Pinia stores (chatStore, callStore, profileStore, chatActionStore)
├── composables/     # Vue composables (useDate, useWindowSize, etc.)
├── types/           # TypeScript type definitions
├── utils/           # Utility functions (format, emojiParser)
├── i18n/            # Translations (Persian)
├── directives/      # Custom Vue directives (v-loading)
├── adapter/         # Chat data adapter pattern
├── styles/          # CSS (Tailwind + theme + components)
└── assets/          # Fonts and data files
```
