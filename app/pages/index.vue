<template>
    <div class="flex w-full h-full max-h-full overflow-hidden">
        <div v-if="showMessagingSection" class="h-full flex-1 relative">
            <ChatView v-if="isInChat" />
            <div v-else class=" w-full h-full flex items-center justify-center ">
                <NoDataDisplay :image-path="NoChatSelected" :title="t('chat.noConversationSelected')" />
            </div>
        </div>

        <div v-if="showContactList" class="md:w-80 w-full h-full shrink-0 border-l border-outline-variant">
            <ChatList />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useI18n, useSeoMeta, useChatStore } from '#imports';
import { useWindowSize } from '#imports';
import NoDataDisplay from '~/components/general/NoDataDisplay.vue';
import NoChatSelected from '/images/chat/no-chat-selected.webp';
import ChatList from '~/components/chat/contact/ChatList.vue';
import ChatView from '~/components/chat/ChatView.vue';

definePageMeta({
    layout: 'chat',
    hideBottomNav: true,
})

export default defineComponent({
    name: 'DashboardChat',
    components: {
        ChatList,
        ChatView,
        NoDataDisplay,
    },
    setup() {
        const { width } = useWindowSize()
        const { t } = useI18n()
        const chatStore = useChatStore()

        const isMobile = computed(() => width.value < 768)
        const isInChat = computed(() => chatStore.activeConversationId !== null)

        const showContactList = computed(() => {
            if (isMobile.value) {
                return !isInChat.value
            } else {
                return true
            }
        })

        const showMessagingSection = computed(() => {
            if (isMobile.value) {
                return isInChat.value
            }
            return true
        })

        useSeoMeta({
            title: () => t('seo.dashboard.chat.title'),
            description: () => t('seo.dashboard.chat.description'),
            ogTitle: () => `${t('seo.siteName')} - ${t('seo.dashboard.chat.title')}`,
        });

        return {
            isInChat,
            isMobile,
            showContactList,
            showMessagingSection,
            NoChatSelected,
            t,
        }
    }
})
</script>
