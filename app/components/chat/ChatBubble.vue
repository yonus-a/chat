<template>
    <div class="w-full transition-all duration-300 ease-in-out"
        :class="[isDeleting ? 'max-h-0 opacity-0 overflow-hidden' : 'max-h-250 opacity-100']">
        <div v-if="message.isFirstInDate || isFirstUnread" class=" py-5 w-full flex items-center justify-center">
            <div class=" rounded-full bg-on-surface/10 flex items-center justify-center px-4 py-0.5">
                <div class=" text-on-surface select-none text-body-sm">{{ !isFirstUnread ?
                    formatDateShort(message.date) : t('chat.unreadMessages') }}</div>
            </div>
        </div>
        <div class=" w-full px-5 pt-2 transition-all duration-200 flex items-center ease-in-out"
            :class="[isSelectMode && isSelected ? ' bg-on-surface/5 gap-x-3' : ' bg-on-surface/0 gap-x-0', isSelectMode ? 'cursor-pointer select-none' : '']">
            <div class=" shrink-0 transition-all duration-200 overflow-hidden ease-in-out whitespace-nowrap"
                :class="[isSelectMode && isSelected ? 'w-auto' : ' w-0']">
                <div :class="[isSelectMode && isSelected ? ' opacity-100 scale-100' : ' opacity-0 scale-0']"
                    class=" transition-all duration-200 ease-in-out w-5 h-5 rounded-full bg-gradient-primary-secondary flex items-center justify-center">
                    <div class="w-2.5 h-2.5 rounded-full bg-surface"></div>
                </div>
            </div>
            <div :class="[isMine ? ' justify-start' : 'justify-end']" class=" flex items-center flex-1 relative"
                @contextmenu.prevent="handleRightClick" @click="handleLeftClick">
                <div class=" w-full">
                    <div class=" w-full flex items-center" :class="[isMine ? 'justify-start' : 'justify-end']">
                        <div class=" flex max-w-4/5 items-end gap-x-3">
                            <div class=" flex-1">
                                <div v-if="messageType === 'text' || messageType === 'file' || messageType === 'voice'"
                                    class="  p-1 rounded-xl "
                                    :class="[roundingClasses, isMine ? 'bg-surface-variant-2' : 'bg-surface', messageType === 'text' ? 'text-body-sm text-on-surface' : '']">
                                    <div v-if="messageType === 'text' && message.repliedTo"
                                        class=" text-body-sm select-none w-full h-10 gap-x-2 flex items-center rounded-lg justify-between p-2"
                                        :class="[isMine ? ' bg-surface-variant-3' : 'bg-surface-variant']">
                                        <div class=" text-on-surface/50 shrink-0">{{ replyName }} :</div>
                                        <div class=" text-on-surface flex-1">
                                            <div class=" w-full overflow-hidden text-ellipsis line-clamp-1">{{
                                                replyContent }}</div>
                                        </div>
                                        <BIcon icon="PhArrowUUpLeft" class=" w-5 h-5 fill-on-surface/20"
                                            weight="fill" />
                                    </div>
                                    <p v-if="messageType === 'text'" class=" p-3 max-w-full">{{ message.text }}</p>
                                    <FileDisplay :is-mine="isMine" v-else-if="message.fileUrl && messageType === 'file'"
                                        :url="message.fileUrl" />
                                    <VoiceDisplay v-else-if="message.voiceUrl && messageType === 'voice'"
                                        :url="message.voiceUrl" />
                                </div>
                                <div v-else-if="message.imageUrl && messageType === 'image'"
                                    class=" cursor-pointer  overflow-hidden rounded-xl w-85 h-40.5">
                                    <BImage @click.stop="previewImage(0)" fit="cover" :src="message.imageUrl[0]"
                                        class=" w-full rounded-xl overflow-hidden h-full max-w-full max-h-full min-w-full min-h-full" />
                                </div>
                                <div v-else-if="message.imageUrl && messageType === 'multiImage'"
                                    class=" max-w-75 flex items-center gap-x-3 h-16">
                                    <div v-for="(image, index) in displayedImages" :key="index"
                                        class=" h-full rounded-xl overflow-hidden aspect-square">
                                        <BImage :src="image" @click.stop="previewImage(index)"
                                            class=" cursor-pointer min-w-full min-h-full max-w-full max-h-full h-full w-full" />
                                        <div @click.stop="previewImage(3)" v-if="message.imageUrl.length > 3"
                                            class=" h-full cursor-pointer aspect-square flex items-center justify-center rounded-xl bg-surface-variant-2">
                                            <div class=" text-on-surface select-none text-label-md">+{{
                                                message.imageUrl.length
                                                - 3 }}</div>
                                        </div>
                                    </div>
                                </div>
                                <div v-else-if="messageType === 'video'">
                                    <BubbleVideo :video-url="message.videoUrl" mode="playback" />
                                </div>
                                <div v-if="shouldShowStatus" class=" w-full pt-2 flex items-center gap-x-2.5"
                                    :class="[isMine ? 'justify-start' : 'justify-end']">
                                    <BIcon v-if="isMine" :icon="checkIcon" class=" w-4 h-4"
                                        :class="[message.isRead && message.isSent ? 'fill-primary' : 'fill-on-surface/50']" />
                                    <div class=" select-none  text-body-sm text-on-surface/50">{{
                                        formatTime(message.date)
                                    }}
                                    </div>
                                </div>
                            </div>
                            <div class=" shrink-0 w-10 pb-8">
                                <div v-if="!isMine && (!isSameSenderNext || !isSameDayNext)" class=" w-10 h-10 ">
                                    <ContactAvatar :contact="contact" :show-online="false" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <ImageGroupDisplay v-if="message.imageUrl && message.imageUrl.length > 0" ref="imageDisplayRef"
                    :images="message.imageUrl" />

                <BubbleOptions @delete="$emit('delete', $event)" :message="message" ref="bubbleOptionsRef" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, type PropType } from 'vue';
import type { Contact, ExtendedMessage } from '~/types/chat';
import { useProfileStore, useDate, useI18n } from '#imports';
import { useChatActionStore } from '~/stores/chatActionStore';
import BubbleVideo from './chat-bubbles/BubbleVideo.vue';
import FileDisplay from './chat-bubbles/FileDisplay.vue';
import VoiceDisplay from './chat-bubbles/VoiceDisplay.vue';
import ContactAvatar from './contact/ContactAvatar.vue';
import ImageGroupDisplay from './chat-bubbles/ImageGroupDisplay.vue';
import BubbleOptions from './chat-bubbles/BubbleOptions.vue';

type ImageDisplayInstance = InstanceType<typeof ImageGroupDisplay>

export default defineComponent({
    name: 'ChatBubble',
    props: {
        message: {
            type: Object as PropType<ExtendedMessage>,
            required: true,
        },
        contact: {
            type: Object as PropType<Contact>,
            required: true,
        },
        isFirstUnread: {
            type: Boolean,
            default: false
        },
        isDeleting: {
            type: Boolean,
            default: false
        }
    },
    components: {
        ImageGroupDisplay,
        BubbleVideo,
        FileDisplay,
        VoiceDisplay,
        ContactAvatar,
        BubbleOptions,
    },
    emits: ['delete'],
    setup(props, { emit }) {
        const profileStore = useProfileStore()
        const chatActionStore = useChatActionStore()
        const { formatDateShort, formatTime } = useDate()
        const { t } = useI18n()

        const isMine = computed(() => props.message.senderId === profileStore.userData.id)
        const imageDisplayRef = ref<ImageDisplayInstance | null>(null);

        // Typing as any to forcefully bypass the TypeScript compilation error for "openMenu does not exist"
        const bubbleOptionsRef = ref<any>(null);

        const messageType = computed(() => {
            if (props.message.voiceUrl && props.message.voiceUrl.trim().length > 0) return 'voice'
            if (props.message.imageUrl && props.message.imageUrl.length > 1) return 'multiImage'
            if (props.message.imageUrl && props.message.imageUrl.length === 1 && props.message.imageUrl[0]?.trim().length > 0) return 'image'
            if (props.message.videoUrl && props.message.videoUrl.trim().length > 0) return 'video'
            if (props.message.fileUrl && props.message.fileUrl.trim().length > 0) return 'file'
            return 'text'
        })

        const isSameDayPrev = computed(() => {
            if (!props.message.prevMessage) return false;
            return new Date(props.message.date).toDateString() === new Date(props.message.prevMessage.date).toDateString();
        });

        const isSameDayNext = computed(() => {
            if (!props.message.nextMessage) return false;
            return new Date(props.message.date).toDateString() === new Date(props.message.nextMessage.date).toDateString();
        });

        const roundingClasses = computed(() => {
            const isPrevSameSender = props.message.prevMessage?.senderId === props.message.senderId;
            if (isMine.value) {
                if (!isPrevSameSender) return 'rounded-br-none';
                return 'rounded-r-none';
            } else {
                if (isPrevSameSender) return 'rounded-l-none';
                return 'rounded-bl-none';
            }
        });

        const shouldShowStatus = computed(() => {
            const nextMsg = props.message.nextMessage;

            // 1. If there is no next message, it's the last one, so show status
            if (!nextMsg) return true;

            const isNextSameSender = nextMsg.senderId === props.message.senderId;

            // 2. If the next message is from a different person or on a different day, show status
            if (!isNextSameSender || !isSameDayNext.value) return true;

            // 3. Check the 10-minute threshold
            const currentTime = new Date(props.message.date).getTime();
            const nextTime = new Date(nextMsg.date).getTime();
            const tenMinutesInMs = 10 * 60 * 1000;

            // Show status only if the next message is sent MORE than 10 minutes later
            return (nextTime - currentTime) > tenMinutesInMs;
        });

        const isSameSenderPrev = computed(() => props.message.prevMessage?.senderId === props.message.senderId);
        const isSameSenderNext = computed(() => props.message.nextMessage?.senderId === props.message.senderId);

        const displayedImages = computed(() => {
            return props.message.imageUrl?.slice(0, 3) || [];
        });

        const previewImage = (index: number) => {
            imageDisplayRef.value?.open(index)
        }

        // --- Context Menu & Select Logic ---
        const handleRightClick = (event: MouseEvent) => {
            if (!chatActionStore.isSelectMode) {
                chatActionStore.selectedMessages.clear();
                chatActionStore.toggleSelection(props.message);
            }
            console.log(event.clientX, event.clientY)
            bubbleOptionsRef.value?.openMenu(event.clientX, event.clientY);
        };

        const handleLeftClick = () => {
            if (chatActionStore.isSelectMode) {
                chatActionStore.toggleSelection(props.message);
            }
        };

        const isSelected = computed(() => chatActionStore.selectedMessages.has(props.message.id));
        const isSelectMode = computed(() => chatActionStore.isSelectMode)

        const checkIcon = computed(() => {
            if (props.message.isSent) {
                return props.message.isRead ? 'PhChecks' : 'PhCheck'
            } else {
                return 'PhClock'
            }
        })

        const replyName = computed(() => {
            if (!props.message.repliedTo) return ''
            let message = props.message.repliedTo
            if (message.senderId === profileStore.userData.id) return t('chat.you')
            return props.contact.name
        })

        const replyContent = computed(() => {
            if (!props.message.repliedTo) return ''
            let message = props.message.repliedTo
            if (message.videoUrl && message.videoUrl.trim().length > 0) return t('chat.attachementTypes.video')
            if (message.voiceUrl && message.voiceUrl.trim().length > 0) return t('chat.attachementTypes.voice')
            if (message.fileUrl && message.fileUrl.trim().length > 0) return t('chat.attachementTypes.file')
            if (message.imageUrl && message.imageUrl.length > 0) return t('chat.attachementTypes.image')
            return message.text
        })



        return {
            formatTime,
            isMine,
            replyContent,
            messageType,
            replyName,
            checkIcon,
            formatDateShort,
            roundingClasses,
            shouldShowStatus,
            isSameSenderNext,
            displayedImages,
            isSameDayNext,
            imageDisplayRef,
            isSameSenderPrev,
            previewImage,
            bubbleOptionsRef,
            handleRightClick,
            handleLeftClick,
            isSelected,
            isSelectMode,
            t,
        }
    }
})
</script>
<style scoped>
@keyframes slide-out-right {
    0% {
        transform: scaleY(-1) translateX(0);
        opacity: 1;
    }

    100% {
        transform: scaleY(-1) translateX(40px);
        opacity: 0;
    }
}

/* Animation for 'Their' messages exiting (Left) */
@keyframes slide-out-left {
    0% {
        transform: scaleY(-1) translateX(0);
        opacity: 1;
    }

    100% {
        transform: scaleY(-1) translateX(-40px);
        opacity: 0;
    }
}

.animate-delete-right {
    animation: slide-out-right 300ms ease-in forwards;
    white-space: nowrap;
    /* Prevents text re-flow during collapse */
}

.animate-delete-left {
    animation: slide-out-left 300ms ease-in forwards;
    white-space: nowrap;
}
</style>