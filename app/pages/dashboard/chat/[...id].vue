<template>
    <div class="  w-full bg-surface-variant h-full">
        <div v-show="canShowMessagingSection" class=" h-full w-full flex">
            <ChatProfileOverview :profile="selectedChat" />
            <div class=" flex flex-1 flex-col justify-between items-center h-full" v-show="chatId">
                <div class=" w-full bg-surface h-16 md:h-20">
                    <ChatPageBar :options="medicOptions" @open-profile="openProfile" :contact="selectedChat" />
                </div>
                <div class="flex-1 w-full min-h-0 overflow-hidden">
                    <ChatMessages :options="medicOptions" v-show="selectedChat" :contact="selectedChat" />
                </div>
                <ChatInput ref="chatInput" :is-active="selectedChat?.isActive" />
            </div>
            <div v-show="!chatId" class=" w-full h-full flex items-center justify-center">
            </div>
        </div>
        <CallPageOverlay v-show="isCallMode && selectedChat" :contact="selectedChat" />
        <PatientReferral ref="patientRefferal" :contact="selectedChat" />
        <PermissionPopup />
    </div>
</template>
<script lang="ts">
import { defineComponent, computed, useTemplateRef } from 'vue';
import { useI18n, useSeoMeta, useWindowSize, useChatStore, useCallStore } from '#imports';
import ChatPageBar from '~/components/chat/ChatPageBar.vue';
import { useRoute, useRouter } from 'vue-router';
import ChatInput from '~/components/chat/ChatInput.vue';
import { type ChatTextField } from '~/types/components/chat-input';
import ChatProfileOverview from '~/components/chat/ChatProfileOverview.vue';
import ChatMessages from '~/components/chat/ChatMessages.vue';
import ChatList from '~/components/chat/contact/ChatList.vue';
import { type MenuOption } from '~/types/components/menu-options';
import PatientReferral from '~/components/chat/PatientReferral.vue';
import type { PatientRefferalExposed } from '~/components/chat/PatientReferral.vue';
import CallPageOverlay from '~/components/call/CallPageOverlay.vue';
import PermissionPopup from '~/components/chat/chat-input/PermissionPopup.vue';
definePageMeta({
    layout: 'dashboard',
    hideBottomNav: true,
    key: (route) => {
        const id = route.params.id;
        return Array.isArray(id) ? id[0] : id;
    }
})

export default defineComponent({
    name: 'ChatPage',
    components: {
        ChatPageBar,
        CallPageOverlay,
        ChatList,
        ChatInput,
        ChatProfileOverview,
        ChatMessages,
        PermissionPopup,
        PatientReferral,
    },
    setup() {
        const chatStore = useChatStore()
        const callStore = useCallStore()
        const route = useRoute()
        const router = useRouter()
        const { t } = useI18n()
        const chatInput = ref<ChatTextField | null>(null)
        const { width } = useWindowSize()


        const isCallMode = computed(() => {
            const params = route.params.id;
            return Array.isArray(params) && params.includes('call');
        });

        const chatId = computed(() => {
            const params = route.params.id;
            const id = Array.isArray(params) ? params[0] : params;
            return id ? parseInt(id as string) : null;
        });

        const selectedChat = computed(() => {
            if (!chatId.value) return null;
            return chatStore.getContactById(chatId.value);
        });



        const isMobile = computed(() => width.value < 768)
        const chatMessagesRef = ref<any>(null);
        const patientRefferal = useTemplateRef<PatientRefferalExposed>('patientRefferal');




        const canShowMessagingSection = computed(() => {
            if (isCallMode.value) return false;
            if (isMobile.value) {
                return !route.query.view;
            }
            return true;
        });




        watch(() => route.params.id, () => {
            if (chatId.value && selectedChat.value?.isActive) {
                nextTick(() => {
                    console.log(chatInput.value)
                    chatInput.value?.focus()
                })
            }
        })





        useSeoMeta({
            title: () => t('seo.dashboard.chat.title'),
            description: () => t('seo.dashboard.chat.description'),
            ogTitle: () => `${t('seo.siteName')} - ${t('seo.dashboard.chat.title')}`,
        });

        const openProfile = () => {
            router.push({ query: { ...route.query, view: 'profile' } })
        }

        const handleNewMessages = (newMsgs: any[]) => { // Replace any with Message type if imported
            if (!newMsgs || newMsgs.length === 0) return;

            // Pass the messages down to the child component
            chatMessagesRef.value?.addMessages(newMsgs);
        };

        const handleEditMessage = (payload: { id: number, text: string }) => {
            //        chatMessagesRef.value?.editMessage(payload.id, payload.text);
        };

        const medicOptions = computed<MenuOption[]>(() => [
            {
                label: t('chat.barOptions.prescribeMedications'),
                icon: 'PhPencilSimpleLine',
                key: 'prescribe-meds',
            },
            {
                label: t('chat.barOptions.addPerson'),
                icon: 'PhUserPlus',
                key: 'add-user',
            },
            {
                label: t('chat.barOptions.refer'),
                icon: 'PhTreeStructure',
                key: 'refer',
            },
            {
                label: t('chat.barOptions.endChat'),
                icon: 'PhXSquare',
                key: 'end-chat',
            },
            {
                label: t('chat.barOptions.deleteMessages'),
                icon: 'PhTrash',
                key: 'delete-all',
                color: 'error'
            },
        ])





        return {
            medicOptions,
            t,
            chatId,
            chatInput,
            isCallMode,
            openProfile,
            patientRefferal,
            chatMessagesRef,
            selectedChat,
            canShowMessagingSection,
            handleNewMessages,
            handleEditMessage,
        }
    }
})
</script>