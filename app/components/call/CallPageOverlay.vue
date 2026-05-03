<template>
    <div class=" flex flex-col w-full h-full bg-diamond-black ">
        <div class=" h-16 sm:h-20 flex items-center justify-between px-4">
            <div class="md:block hidden text-white select-none text-label-lg">{{ t('chat.call.title') }}</div>
            <div class=" bg-black-500 md:hidden rounded-full flex items-center gap-x-4 h-10 px-3">
                <BIcon icon="PhLightning" @click="handleOptions('toggle-flash')"
                    class=" cursor-pointer fill-white w-6 h-6" />
                <BIcon icon="PhArrowsClockwise" @click="handleOptions('flip-camera')"
                    class=" cursor-pointer fill-white w-6 h-6" />
            </div>
            <div class=" flex items-center gap-x-4.5">
                <div
                    class=" h-6 flex items-center justify-center bg-diamond-error rounded-full px-2 text-white select-none">
                    <div class=" text-body-sm">00:20</div>
                </div>
                <BIcon icon="PhArrowLeft" @click="goBack" class=" w-5 h-5 fill-white cursor-pointer" />
            </div>
        </div>
        <div class=" w-full p-3 sm:p-6 flex-1">
            <div class="w-full h-full min-h-0 relative">
                <TransitionGroup name="layout" tag="div" :class="wrapperClasses">
                    <CallMemberDisplay v-for="(member, index) in callMembers.slice(0, 6)" :key="member.id"
                        :contact="member" :is-full-screen="fullScreenId === member.id"
                        @toggle-fullscreen="toggleFullScreen(member.id)" :class="getMemberClass(member, index)" />
                </TransitionGroup>
            </div>
        </div>
        <div
            class=" w-full h-21 flex justify-center gap-x-1.5 sm:gap-x-3 items-center bg-black-600 border-t border-t-[#2C2C2E]">
            <div class=" bg-black-500 w-9 sm:w-12 cursor-pointer aspect-square rounded-full flex items-center justify-center"
                @click="handleOptions(option.key)" v-for="option in optionButtons" :key="option.key">
                <BIcon :icon="option.icon" class=" sm:w-6 sm:h-6 w-4 h-4 fill-white" />
            </div>
            <div @click="handleOptions('leave-call')"
                class=" rounded-full w-12 sm:w-15 aspect-square bg-diamond-error cursor-pointer flex items-center justify-center">
                <BIcon icon="PhPhoneX" class=" w-5 h-5 sm:w-7 sm:h-7 fill-white" />
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { type PropType, defineComponent, computed } from 'vue';
import type { Contact } from '~/types/chat';
import { useI18n, useCallStore, useWindowSize } from '#imports';
import { useRouter } from 'vue-router';
import CallMemberDisplay from './CallMemberDisplay.vue';
export default defineComponent({
    name: 'CallPageOverlay',
    props: {
        contacts: {
            type: Object as PropType<Contact[]>,
            required: true,
            default: () => []
        }
    },
    components: {
        CallMemberDisplay,
    },
    setup(props) {
        const router = useRouter()
        const { t } = useI18n()
        const callStore = useCallStore()
        const { width } = useWindowSize()


        const isMobile = computed(() => width.value < 768);

        const fullScreenId = ref<number | null>(null);

        const toggleFullScreen = (id: number) => {
            fullScreenId.value = fullScreenId.value === id ? null : id;
        };

        // Replace gridLayoutClasses with wrapperClasses
        const wrapperClasses = computed(() => {
            if (!fullScreenId.value) {
                // Grid Layout Mode
                const count = callMembers.value.length;
                const gap = isMobile.value ? 'gap-3' : 'gap-4';
                let gridLayout = 'grid-cols-2';

                if (count === 1) gridLayout = 'grid-cols-1 grid-rows-1';
                else if (count === 2) gridLayout = 'grid-cols-1 grid-rows-2';
                else if (count === 3) gridLayout = 'grid-cols-1 grid-rows-3';
                else if (count === 4) gridLayout = 'grid-cols-2 grid-rows-2';
                else if (count === 6) gridLayout = 'grid-cols-2 grid-rows-3';

                return `grid ${gridLayout} ${gap} w-full h-full p-4 relative`;
            }

            // Full Screen Mode Wrapper
            // 'block' is used instead of grid to prevent CSS grid from interfering with absolute positioning
            return isMobile.value
                ? `block relative w-full h-full`
                : `flex flex-row flex-wrap content-start w-full h-full p-4 gap-4 relative overflow-hidden`;
        });

        const getMemberClass = (member: Contact, index: number) => {
            const base = 'transition-all duration-300 ease-in-out origin-center';

            if (!fullScreenId.value) {
                if (callMembers.value.length === 5 && index === 0) return `${base} col-span-2`;
                return base;
            }

            if (isMobile.value) {
                if (member.id === fullScreenId.value) {
                    // 1. Target Full Screen
                    // !absolute overrides the child's 'relative' class.
                    // top/left/right/bottom-4 gives it a perfect 16px margin around the whole screen.
                    return `${base} !absolute top-0 left-0 right-0 bottom-0 z-0`;
                }
                if (index === 0) {
                    // 2. Local User PIP (You)
                    // Placed at the bottom-right cleanly. !w and !h override the child's w-full/h-full.
                    return `${base} !absolute bottom-8 right-6 z-20 !w-[110px] !h-[150px] shadow-2xl rounded-2xl`;
                }
                // 3. Hidden Members
                // They shrink into the center and fade out so the transition looks smooth
                return `${base} !absolute top-1/2 left-1/2 opacity-0 scale-0 pointer-events-none z-[-1]`;
            } else {
                // Desktop Layout
                if (member.id === fullScreenId.value) {
                    return `${base} !w-full !h-[calc(100%-11rem)] order-1`;
                }
                return `${base} flex-1 min-w-[140px] max-w-[200px] !h-36 order-2`;
            }
        };

        const callMembers = computed(() => callStore.callMembers)

        const optionButtons = computed(() => [
            {
                icon: 'PhX',
                key: 'minimize-call'
            },
            {
                icon: 'PhMonitorArrowUp',
                key: 'share-screen'
            },
            {
                icon: 'PhUserPlus',
                key: 'add-user'
            },
            {
                icon: 'PhSpeakerHigh',
                key: 'toggle-sound'
            },
            {
                icon: 'PhMicrophone',
                key: 'toggle-mic'
            },
            {
                icon: 'PhVideoCamera',
                key: 'toggle-video'
            },
        ])

        const goBack = () => {
            router.go(-1)
        }

        const handleOptions = (key: string) => {
            switch (key) {
                case 'minimize-call':

                    break;
                case 'share-screen':

                    break;
                case 'add-user':

                    break;
                case 'toggle-sound':

                    break;
                case 'toggle-mic':

                    break;
                case 'toggle-video':

                    break;
                case 'leave-call':

                    break;
                case 'flip-camera':

                    break;
                case 'toggle-flash':

                    break;
            }
        }

        return {
            t,
            wrapperClasses,
            optionButtons,
            callMembers,
            goBack,
            handleOptions,
            getMemberClass,
            isMobile,
            fullScreenId,
            toggleFullScreen,
        }
    }
})
</script>