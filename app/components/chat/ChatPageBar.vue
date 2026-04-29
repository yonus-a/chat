<template>
    <div v-if="selectedChat"
        class="w-full h-16 z-50 md:h-20 gap-x-4 relative bg-surface border-b border-b-outline-variant flex items-center justify-between py-4 px-5">
        <div
            class=" w-full md:flex-row flex-row-reverse relative items-center justify-end gap-x-4 md:justify-between flex">
            <div @click="openProfile" class="cursor-pointer flex items-center gap-x-3">
                <div class="w-10 h-10 relative shrink-0">
                    <ContactAvatar v-if="contact" :contact="contact" />
                </div>
                <div class="select-none">
                    <div class="text-on-surface text-label-md">{{ selectedChat.name }} {{ selectedChat.lastName }}</div>
                    <div class="text-on-surface/50 text-body-sm">
                        {{ t('chat.lastSeen', { time: formatRelativeDate(selectedChat.lastSeen) }) }}
                    </div>
                </div>
            </div>

            <div class=" relative h-6">
                <div class="relative transition-all duration-200 ease-in-out"
                    :class="[isSelectMode ? '-translate-y-6' : 'translate-y-0']">
                    <div class="flex relative items-center gap-x-4 transition-all duration-200 ease-in-out"
                        :class="[isSelectMode ? ' pointer-events-none opacity-0' : ' opacity-100 pointer-events-auto']">
                        <div class="  hidden md:block">
                            <BIcon icon="PhPhone" v-if="selectedChat.serviceType !== 'chat'"
                                class="w-6 h-6 fill-on-surface/50 cursor-pointer" @click="handleAction('call')" />
                        </div>


                        <BMenu ref="menuRef" @select="handleSelect" @close="resetMenuMode" :options="options">
                            <template #trigger>
                                <BIcon @click="menuMode" icon="PhDotsThreeVertical"
                                    class="w-6 h-6 fill-on-surface/50 cursor-pointer" aria-haspopup="true"
                                    aria-controls="overlay_menu" />
                            </template>
                            <div v-if="menuMode === 'medic'" class="p-1">
                                <MedicSelector @close="closeMenu" />
                            </div>
                        </BMenu>
                    </div>
                    <div :class="[!isSelectMode ? ' pointer-events-none opacity-0' : ' opacity-100 pointer-events-auto']"
                        class=" flex items-center gap-x-4 ">
                        <BIcon @click="deleteMessages" icon="PhTrash" class=" w-6 h-6 "
                            :class="[canDelete ? 'fill-error cursor-pointer' : 'cursor-not-allowed fill-on-surface/50']" />
                        <BIcon @click="copy" icon="PhCopy" class=" w-6 h-6 cursor-pointer fill-on-surface" />
                    </div>
                </div>
            </div>
        </div>
        <BIcon @click="goBack" icon="PhArrowLeft" class=" md:hidden fill-on-surface/50 w-6 h-6 cursor-pointer" />
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, type PropType } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useChatStore, useChatActionStore, useI18n, useDate } from '#imports';
import type { Menu } from '~/types/components/menu';
import type { Contact } from '~/types/chat';
import ContactAvatar from './contact/ContactAvatar.vue';
import type { MenuOption } from '~/types/components/menu-options';
import MedicSelector from './medic-features/MedicSelector.vue';

export default defineComponent({
    name: 'PageBar',
    props: {
        contact: {
            type: Object as PropType<Contact | null>,
            required: true,
        },
        options: {
            type: Array as PropType<MenuOption[]>,
            default: () => [],
            required: true,
        }
    },
    components: {
        ContactAvatar,
        MedicSelector,
    },
    emits: ['call', 'open-profile'],
    setup(props, { emit }) {
        const chatActionStore = useChatActionStore()
        const { formatRelativeDate } = useDate();
        const chatStore = useChatStore();
        const route = useRoute();
        const router = useRouter()
        const { t } = useI18n();
        const menuRef = ref<Menu | null>(null)
        const selectedChat = computed(() => props.contact)
        const menuMode = ref<'medic' | 'options'>('options')

        const isSelectMode = computed(() => chatActionStore.isSelectMode)
        const canDelete = computed(() => chatActionStore.canDelete)
        // Template Ref for the Menu





        const actions = ref([
            { icon: 'PhPhone', key: 'call' },
            //    { icon: 'PhMagnifyingGlass', key: 'search' },
        ]);

        const handleAction = (key: 'search' | 'call') => {
            switch (key) {
                case 'call':
                    emit('call')
                    break;
                case 'search':

                    break;
            }
        };

        const handleMenuAction = (key: string) => {
            switch (key) {
                case 'add-user':
                    menuRef.value?.close()
                    setTimeout(() => {
                        menuRef.value?.open()
                    }, 200)
                    break;
                case 'delete-all':

                    break;
                case 'end-chat':

                    break;
                case 'refer':

                    break;
            }
            menuRef.value?.close()
        }


        const openProfile = () => {
            emit('open-profile')
        }

        const goBack = () => {
            router.go(-1)
        }

        const copy = () => {
            chatActionStore.copyMessageText()
        }

        const deleteMessages = () => {
            if (!canDelete.value) return
            chatActionStore.triggerDelete();
        }

        const isTransitioning = ref(false)

        const handleSelect = (key: string) => {
            console.log(key, 'fuck')
            if (key === 'add-user') {
                isTransitioning.value = true;
                menuRef.value?.close();
                setTimeout(() => {
                    menuMode.value = 'medic';
                    setTimeout(() => {
                        menuRef.value?.open();
                        isTransitioning.value = false;
                    }, 200);
                }, 200)
            } else {
                menuRef.value?.close();
            }
        };

        const resetMenuMode = () => {
            if (isTransitioning.value) return
            setTimeout(() => {
                menuMode.value = 'options'
            }, 300);
        };

        const closeMenu = () => {
            menuRef.value?.close()
        }

        return {
            t,
            copy,
            selectedChat,
            resetMenuMode,
            formatRelativeDate,
            deleteMessages,
            actions,
            handleMenuAction,
            handleAction,
            menuRef,
            isSelectMode,
            goBack,
            canDelete,
            closeMenu,
            openProfile,
            handleSelect,
            menuMode,
        };
    }
})
</script>