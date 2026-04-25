<template>
    <div dir="rtl" id="list" ref="scrollContainer"
        class="h-full w-full overflow-y-auto pb-4 hide-scrollbar flip-vertical px-5 bg-surface-variant/30"
        @scroll="handleScroll" @wheel.prevent="handleWheel">

        <div v-show="messages.length">
            <div :style="{ height: virtualizer.getTotalSize() + 'px', width: '100%', position: 'relative' }">
                <div v-for="virtualRow in virtualizer.getVirtualItems()" :key="reversedMessages[virtualRow.index].id"
                    :data-index="virtualRow.index" :ref="(el) => el && virtualizer.measureElement(el)" :style="{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${virtualRow.start}px)`
                    }">

                    <div class="flip-vertical"
                        :class="[getSpacingClass(virtualRow.index, reversedMessages[virtualRow.index]), virtualRow.index === 0 ? 'pb-2' : '']">
                        <ChatBubble :message="reversedMessages[virtualRow.index]"
                            :is-self="reversedMessages[virtualRow.index].senderId === currentUserId"
                            :contact="contact" />
                    </div>

                </div>
            </div>

            <div ref="loaderRef" v-show="isLoading"
                class="w-full flex h-16 justify-center items-center shrink-0 overflow-hidden transition-all duration-300 flip-vertical py-4">
                <div>
                    <LottieAnimation :animation-data="loading" :height="52" :width="52" :loop="true"
                        :auto-play="true" />
                </div>
            </div>
        </div>

        <div v-show="messages.length === 0 && !isLoading"
            class="h-full flex items-center justify-center text-on-surface/50 text-body-md flip-vertical">
            <NoDataDisplay :title="t('chat.noMessages')" :image-path="NoMessages" />
        </div>
        <div v-show="messages.length === 0 && isLoading"
            class=" w-full flex h-full flip-vertical items-center justify-center">
            <LottieAnimation :animation-data="loading" :height="52" :width="52" :loop="true" :auto-play="true" />
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed, onMounted, onBeforeUnmount, watch, type PropType } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n, useChatStore } from '#imports';
import { useVirtualizer } from '@tanstack/vue-virtual';
import ChatBubble from './ChatBubble.vue';
import type { Message, MessageType, Contact, ExtendedMessage } from '~/types/chat';
import loading from '@/assets/lottie/loading.json'
import NoDataDisplay from '../general/NoDataDisplay.vue';
import NoMessages from '/images/chat/no-messages.webp'
import { useProfileStore } from '#imports';


export default defineComponent({
    name: 'ChatMessages',
    components: { ChatBubble, NoDataDisplay },
    props: {
        contact: {
            type: Object as PropType<Contact>,
            required: true,
        }
    },
    setup(props) {
        const profileStore = useProfileStore()
        const route = useRoute();
        const chatStore = useChatStore();
        const { t } = useI18n();
        const scrollContainer = ref<HTMLElement | null>(null);
        const loaderRef = ref<HTMLElement | null>(null);
        let observer: IntersectionObserver | null = null;

        const messages = ref<Message[]>([]);
        const isLoading = ref(false);
        const currentPage = ref(1);
        const maxPages = 5;
        const currentUserId = 1;

        // --- ENRICHMENT LOGIC ---
        // 1. Process messages to add prev/next/contact and date-separation info
        const reversedMessages = computed(() => {
            const raw = messages.value;
            const enriched: ExtendedMessage[] = raw.map((msg, idx) => {
                const prev = raw[idx - 1];
                const next = raw[idx + 1];

                // Check if this is the first message of a new day
                // (Comparing to the previous message in chronological order)
                const isFirstInDate = !prev ||
                    new Date(msg.date).toDateString() !== new Date(prev.date).toDateString();

                return {
                    ...msg,
                    prevMessage: prev,
                    nextMessage: next,
                    isFirstInDate,
                    contact: chatStore.getContactById(msg.senderId)
                };
            });

            // Return reversed for the flipped UI (Newest at index 0)
            return enriched.reverse();
        });

        // 2. TanStack Setup
        const virtualizer = useVirtualizer(computed(() => ({
            count: reversedMessages.value.length,
            getScrollElement: () => scrollContainer.value,
            estimateSize: () => 80,
            overscan: 15,
        })));

        // 3. Spacing Logic
        const getSpacingClass = (index: number, item: ExtendedMessage) => {
            if (item.isFirstInDate) return 'pt-10'; // Extra space for date separator
            if (index === reversedMessages.value.length - 1) return 'pt-4';

            // Logic based on the visual message below (which is idx - 1 in reversed array)
            const msgBelow = reversedMessages.value[index - 1];
            if (msgBelow && msgBelow.senderId === item.senderId) return 'pt-1';

            return 'pt-4';
        };

        // 4. Mock Data Generation (dates now span multiple days)
        const generateMockMessages = (page: number): Message[] => {
            const scenarios = ["text", "voice", "text", "image", "file", "multiImage", "text", "video", "text", "voice"];

            return Array.from({ length: 20 }).map((_, i) => {
                const id = 1000 - ((page - 1) * 20 + (19 - i));
                const scenario = scenarios[id % scenarios.length];
                const clumpIndex = Math.floor(id / 3);
                const isMe = clumpIndex % 2 === 0;
                const senderId = isMe ? profileStore.userData.id : 2;
                const baseOffset = ((page - 1) * 20 + (19 - i)) * 1000 * 60 * 60 * 6;
                const jitter = (id % 5) * 1000 * 60 * 15;
                const messageDate = new Date(Date.now() - (baseOffset + jitter));

                return {
                    id,
                    conversationId: Number(route.params.id) || 101,
                    date: messageDate,
                    type: (scenario === 'multiImage' ? 'image' : scenario) as MessageType,

                    text: scenario === "text"
                        ? `Message ${id}: ${isMe ? 'Sent by me.' : 'Received from them.'} Testing grouping and CORS.`
                        : undefined,

                    imageUrl: scenario === "image"
                        ? [`https://picsum.photos/600/600?sig=${id}`]
                        : scenario === "multiImage"
                            ? [
                                `https://picsum.photos/600/600?sig=${id}_1`,
                                `https://picsum.photos/600/600?sig=${id}_2`,
                                `https://picsum.photos/600/600?sig=${id}_3`
                            ]
                            : undefined,

                    // CORS-FRIENDLY PDF (W3C Sample)
                    fileUrl: scenario === "file"
                        ? `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf?id=${id}`
                        : undefined,

                    // CORS-FRIENDLY VOICE (MDN Sample)
                    voiceUrl: scenario === "voice"
                        ? `https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3?id=${id}`
                        : undefined,

                    // VIDEO (W3Schools usually allows standard streaming)
                    videoUrl: scenario === "video"
                        ? 'https://www.w3schools.com/html/mov_bbb.mp4'
                        : undefined,

                    isEdited: id % 8 === 0,
                    senderId: senderId,
                    isSent: id % 20 !== 0,
                    isRead: isMe ? (id % 3 !== 0) : true,
                };
            });
        };

        const fetchMessages = async (page: number) => {
            if (isLoading.value || page > maxPages) return;
            isLoading.value = true;
            await new Promise(resolve => setTimeout(resolve, 800));
            const newBatch = generateMockMessages(page);
            messages.value = [...newBatch, ...messages.value];
            currentPage.value = page;
            isLoading.value = false;
        };

        const handleScroll = () => {
            const el = scrollContainer.value;
            if (el && (el.scrollHeight - el.scrollTop - el.clientHeight < 100) && !isLoading.value && messages.value.length > 0) {
                fetchMessages(currentPage.value + 1);
            }
        };

        // ... Smooth Wheel Logic remains the same ...
        const targetScroll = ref(0);
        let animationFrame: number | null = null;
        const handleWheel = (e: WheelEvent) => {
            if (!scrollContainer.value) return;
            if (messages.value.length > 0) {
                if (targetScroll.value === 0) targetScroll.value = scrollContainer.value.scrollTop;
                targetScroll.value -= e.deltaY;
                const maxScroll = scrollContainer.value.scrollHeight - scrollContainer.value.clientHeight;
                targetScroll.value = Math.max(0, Math.min(targetScroll.value, maxScroll));
                if (!animationFrame) smoothScrollLoop();
            }
        };
        const smoothScrollLoop = () => {
            if (!scrollContainer.value) return;
            const current = scrollContainer.value.scrollTop;
            const target = targetScroll.value;
            const distance = (target - current) * 0.22;
            if (Math.abs(distance) > 0.5) {
                scrollContainer.value.scrollTop += distance;
                animationFrame = requestAnimationFrame(smoothScrollLoop);
            } else {
                scrollContainer.value.scrollTop = target;
                animationFrame = null;
            }
        };

        watch(() => route.params.id, (newId) => {
            if (newId) {
                messages.value = [];
                currentPage.value = 1;
                if (scrollContainer.value) scrollContainer.value.scrollTop = 0;
                fetchMessages(1);
            }
        });

        onMounted(() => {
            fetchMessages(1);
            setTimeout(() => {
                observer = new IntersectionObserver(([entry]) => {
                    if (entry.isIntersecting && !isLoading.value && messages.value.length > 0) {
                        fetchMessages(currentPage.value + 1);
                    }
                }, { root: scrollContainer.value, threshold: 0, rootMargin: '150px' });
                if (loaderRef.value) observer.observe(loaderRef.value);
            }, 500);
        });

        onBeforeUnmount(() => {
            if (observer) observer.disconnect();
            if (animationFrame) cancelAnimationFrame(animationFrame);
        });

        return {
            t, scrollContainer, loaderRef, virtualizer, reversedMessages,
            messages, handleWheel, isLoading, currentUserId, loading,
            NoMessages, getSpacingClass, handleScroll,
        };
    }
});
</script>

<style scoped>
/* Add this to your existing styles */
.flip-vertical {
    transform: scaleY(-1);
    /* Optimization for smooth virtual scrolling */
    will-change: scroll-position;
}

/* Force hardware acceleration on the bubbles */
[data-index] {
    will-change: transform;
    backface-visibility: hidden;
}

.hide-scrollbar::-webkit-scrollbar {
    display: none;
}
</style>