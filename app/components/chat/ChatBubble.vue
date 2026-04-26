<template>
    <div :class="[isMine ? ' justify-start' : 'justify-end']" class=" flex items-center  w-full">
        <div class=" w-full">

            <div v-if="message.isFirstInDate" class=" py-5 w-full flex items-center justify-center">
                <div class=" rounded-full bg-on-surface/10 flex items-center justify-center px-4 py-0.5">
                    <div class=" text-on-surface select-none text-body-sm">{{ formatDateShort(message.date) }}</div>
                </div>
            </div>
            <div class=" w-full flex items-center" :class="[isMine ? 'justify-start' : 'justify-end']">
                <div class=" flex max-w-4/5 items-end gap-x-3">
                    <div class=" flex-1">
                        <div v-if="messageType === 'text' || messageType === 'file' || messageType === 'voice'"
                            class="  p-3 rounded-xl "
                            :class="[roundingClasses, isMine ? 'bg-surface-variant-2' : 'bg-surface', messageType === 'text' ? 'text-body-sm text-on-surface' : '']">
                            <p v-if="messageType === 'text'" class=" max-w-full">{{ message.text }}</p>
                            <FileDisplay :is-mine="isMine" v-else-if="message.fileUrl && messageType === 'file'"
                                :url="message.fileUrl" />
                            <VoiceDisplay v-else-if="message.voiceUrl && messageType === 'voice'"
                                :url="message.voiceUrl" />
                        </div>
                        <div v-else-if="message.imageUrl && messageType === 'image'"
                            class=" cursor-pointer  overflow-hidden rounded-xl w-85 h-40.5">
                            <BImage @click="previewImage(0)" fit="cover" :src="message.imageUrl[0]"
                                class=" w-full rounded-xl overflow-hidden h-full max-w-full max-h-full min-w-full min-h-full" />
                        </div>
                        <div v-else-if="message.imageUrl && messageType === 'multiImage'"
                            class=" max-w-75 flex items-center gap-x-3 h-16">
                            <div v-for="(image, index) in displayedImages" :key="index"
                                class=" h-full rounded-xl overflow-hidden aspect-square">
                                <BImage :src="image" @click="previewImage(index)"
                                    class=" cursor-pointer min-w-full min-h-full max-w-full max-h-full h-full w-full" />
                                <div @click="previewImage(3)" v-if="message.imageUrl.length > 3"
                                    class=" h-full cursor-pointer aspect-square flex items-center justify-center rounded-xl bg-surface-variant-2">
                                    <div class=" text-on-surface select-none text-label-md">+{{ message.imageUrl.length
                                        - 3 }}</div>
                                </div>
                            </div>
                        </div>
                        <div v-else-if="messageType === 'video'">
                            <BubbleVideo :video-url="message.videoUrl" mode="playback" />
                        </div>
                        <div class=" w-full pt-2 flex items-center gap-x-2.5"
                            :class="[isMine ? 'justify-start' : 'justify-end']">
                            <BIcon v-if="isMine" :icon="message.isRead ? 'PhChecks' : 'PhCheck'" class=" w-4 h-4"
                                :class="[message.isRead ? 'fill-primary' : 'fill-on-surface/50']" />
                            <div class=" select-none  text-body-sm text-on-surface/50">{{ formatTime(message.date) }}
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
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue';
import type { Contact, ExtendedMessage } from '~/types/chat';
import { useProfileStore, useDate } from '#imports';
import BubbleVideo from './chat-bubbles/BubbleVideo.vue';
import FileDisplay from './chat-bubbles/FileDisplay.vue';
import VoiceDisplay from './chat-bubbles/VoiceDisplay.vue';
import ContactAvatar from './contact/ContactAvatar.vue';
import ImageGroupDisplay from './chat-bubbles/ImageGroupDisplay.vue';
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
        }
    },
    components: {
        ImageGroupDisplay,
        BubbleVideo,
        FileDisplay,
        VoiceDisplay,
        ContactAvatar,
    },
    setup(props) {
        const profileStore = useProfileStore()
        const { formatDateShort, formatTime } = useDate()
        const isMine = computed(() => props.message.senderId === profileStore.userData.id)
        const imageDisplayRef = ref(null);

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

        // --- Rounding Logic ---
        const roundingClasses = computed(() => {
            const isPrevSameSender = props.message.prevMessage?.senderId === props.message.senderId;
            if (isMine.value) {
                // For "Mine" messages (based on your template's start alignment)
                if (!isPrevSameSender) return 'rounded-br-none';
                return 'rounded-r-none';
            } else {
                // For "Other" messages
                if (isPrevSameSender) return 'rounded-l-none';
                return 'rounded-bl-none';
            }
        });

        // --- Status (Time/Read) Display Logic ---
        const shouldShowStatus = computed(() => {
            const isNextSameSender = props.message.nextMessage?.senderId === props.message.senderId;
            if (!props.message.nextMessage || !isNextSameSender || !isSameDayNext.value) {
                return true;
            }
            return false;
        });

        const isSameSenderPrev = computed(() => props.message.prevMessage?.senderId === props.message.senderId);
        const isSameSenderNext = computed(() => props.message.nextMessage?.senderId === props.message.senderId);

        const displayedImages = computed(() => {
            return props.message.imageUrl?.slice(0, 3) || [];
        });

        const previewImage = (index: number) => {
            imageDisplayRef.value?.open(index)
        }

        return {
            formatTime,
            isMine,
            messageType,
            formatDateShort,
            roundingClasses,
            shouldShowStatus,
            isSameSenderNext,
            displayedImages,
            isSameDayNext,
            imageDisplayRef,
            isSameSenderPrev,
            previewImage,
        }
    }
})

</script>