<template>
    <Teleport to="body">
        <div :style="{ position: 'fixed', top: `${position.y}px`, left: `${position.x}px`, zIndex: 99999, pointerEvents: 'none' }"
            dir="rtl">

            <BMenu ref="menuRef" @closed="onMenuClosed">
                <template #trigger>
                    <div style="width: 1px; height: 1px;"></div>
                </template>

                <div
                    class="w-40 p-3 flex flex-col gap-y-1 bg-surface shadow-floating rounded-xl border border-outline-variant pointer-events-auto">
                    <div @click="handleOption(option.key)"
                        class="bg-surface-variant-2/0 hover:bg-surface-variant-2 transition-all duration-200 ease-in-out h-11 flex items-center cursor-pointer rounded-lg px-2 gap-x-2 w-full"
                        v-for="option in options" :key="option.key">
                        <BIcon :icon="option.icon" class="w-5 h-5"
                            :class="[option.color ? `fill-${option.color}` : 'fill-on-surface/50']" />
                        <div class="select-none text-label-sm"
                            :class="[option.color ? `text-${option.color}` : 'text-on-surface/50']">
                            {{ option.title }}</div>
                    </div>
                </div>
            </BMenu>
        </div>
    </Teleport>
</template>

<script lang="ts">
import { defineComponent, ref, computed, nextTick, type PropType } from 'vue';
import { useI18n, useAppToast } from '#imports';
import { useChatActionStore } from '~/stores/chatActionStore';
import { useProfileStore, useDate } from '#imports';
import type { Menu } from '~/types/components/menu';
import type { ExtendedMessage } from '~/types/chat';
export default defineComponent({
    name: 'BubbleOptions',
    props: {
        message: {
            type: Object as PropType<ExtendedMessage>,
            required: true,
        }
    },
    emits: ['delete'],
    setup(props, { expose, emit }) {
        const { t } = useI18n();
        const { openToast } = useAppToast();
        const { formatDateShort, formatTime } = useDate();
        const chatActionStore = useChatActionStore();
        const profileStore = useProfileStore();
        const isOpen = ref(false);

        const menuRef = ref<Menu | null>(null);
        const position = ref({ x: 0, y: 0 });

        const openMenu = (x: number, y: number) => {
            // Adjust bounds so the menu doesn't clip off the right/bottom edges of the screen
            const adjustedX = Math.min(x, window.innerWidth - 250);
            const adjustedY = Math.min(y, window.innerHeight - 300);

            position.value = { x: adjustedX, y: adjustedY };
            isOpen.value = true;
            chatActionStore.isMenuOpen = true;

            // Wait 1 frame for the wrapper to mount at the coordinates, then fire BMenu
            nextTick(() => {
                menuRef.value?.open();
            });
        };

        const closeMenu = () => {
            menuRef.value?.close();
            chatActionStore.isMenuOpen = false;
        };

        const onMenuClosed = () => {
            isOpen.value = false;
            chatActionStore.isMenuOpen = false;
        };

        expose({ openMenu, closeMenu });

        const isTargetSelected = computed(() => chatActionStore.selectedMessages.has(props.message.id));

        const showAsDeselect = computed(() => {
            return chatActionStore.isSelectMode && chatActionStore.selectedMessages.has(props.message.id);
        });
        //PhXCircle
        //t('chat.messageOptions.deselect')
        const options = computed(() => {
            const allOptions = [
                { icon: 'PhArrowBendUpLeft', key: 'reply', title: t('chat.messageOptions.reply'), canShow: props.message.isSent },
                { icon: 'PhPencilSimpleLine', key: 'edit', title: t('chat.messageOptions.edit'), canShow: chatActionStore.canEdit },
                { icon: 'PhCopy', key: 'copy', title: t('chat.messageOptions.copy'), canShow: true },
                {
                    icon: showAsDeselect.value ? 'PhXCircle' : 'PhCheckCircle',
                    key: 'select_toggle',
                    title: showAsDeselect.value ? t('chat.messageOptions.deselect') : t('chat.messageOptions.select'),
                    canShow: true
                },
                { icon: 'PhTrash', key: 'delete', title: t('chat.messageOptions.delete'), canShow: chatActionStore.canDelete, color: 'error' }
            ];
            return allOptions.filter((option) => option.canShow);
        });

        const handleOption = (key: string) => {
            const targets = chatActionStore.selectedArray;
            closeMenu();

            setTimeout(() => {

                switch (key) {
                    case 'delete':
                        emit('delete', targets.map(t => t.id));
                        chatActionStore.clearActions();
                        break;
                    case 'select_toggle':
                        if (!chatActionStore.isSelectMode) {
                            chatActionStore.startSelectMode(props.message);
                        } else {
                            chatActionStore.toggleSelection(props.message);
                        }
                        break;
                    case 'edit':
                        chatActionStore.editingMessage = props.message;
                        break;
                    case 'reply':
                        if (!props.message.isSent) return
                        chatActionStore.replyingTo = props.message;
                        break;
                    case 'copy':
                        copyMessageText(targets);
                        chatActionStore.clearActions();
                        break;
                }

            }, 300)
        };

        const copyMessageText = (messages: any[]) => {
            const textToCopy = messages.map(msg => {
                const isMine = msg.senderId === profileStore.userData.id;
                const senderName = isMine ? t('chat.you') : msg.contact?.name || 'User';
                const dateTime = `${formatDateShort(msg.date)}, ${formatTime(msg.date)}`;
                const content = msg.text || (msg.imageUrl ? '[Image]' : msg.voiceUrl ? '[Voice]' : '[File]');
                return `${senderName} [${dateTime}]:\n${content}`;
            }).join('\n\n');

            navigator.clipboard.writeText(textToCopy).then(() => {
                openToast(t('chat.copiedMessage'), 'success');
            });
        };

        return {
            t, options, position, menuRef,
            closeMenu, openMenu, handleOption, onMenuClosed, isOpen,
        };
    }
});
</script>