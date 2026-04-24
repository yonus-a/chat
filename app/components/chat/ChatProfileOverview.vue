<template>
    <div class="transition-all duration-300 ease-in-out h-full overflow-hidden rtl:border-l-surface-variant ltr:border-surface-variant ltr:border-r rtl:border-l bg-surface shrink-0"
        :class="[isOpen ? 'w-80' : 'w-0 border-none!']">
        <div class="w-80 h-full flex flex-col">
            <div class=" pt-16.5 px-2 w-full h-full">
                <div class=" w-full  relative">
                    <div class=" w-full h-29">
                        <BImage
                            class=" rounded-xl overflow-hidden w-full h-full max-w-full min-w-full max-h-full min-h-full"
                            :src="profileBackground">
                            <div class=" w-full h-full p-2">
                                <BIcon icon="PhX" class=" fill-white w-5 h-5 cursor-pointer" @click="closeSidebar" />
                            </div>
                        </BImage>
                    </div>
                    <div class=" w-full absolute z-20 flex justify-center items-center -translate-y-1/2">
                        <div class=" w-25 h-25 rounded-full overflow-hidden">
                            <BImage v-loading="isLoading" class=" w-full h-full min-w-full min-h-full max-w-full max-h-full "
                                :src="localProfile.imageUrl" />
                        </div>
                    </div>
                    <div class=" h-12.5 w-full"></div>
                </div>
                <div class=" w-full mt-2 flex flex-col items-center select-none justify-center gap-y-2">
                    <div v-loading="isLoading" class=" text-title-md text-on-surface">{{ localProfile.name }}</div>
                    <BLabel v-loading="isLoading" color="primary" :text="t('chat.online')" v-if="localProfile.isOnline" />
                </div>
                <div class=" w-full px-6">
                    <div class=" w-full py-4 flex items-center justify-center gap-x-2">
                        <div v-loading="isLoading" @click="handleAction(action)"
                            class=" w-15.5 aspect-square flex items-center flex-col gap-y-0.5 justify-center rounded-xl bg-surface-variant transition-all duration-200 ease-in-out"
                            v-for="action in actionButtons" :key="action.key"
                            :class="[action.active ? 'opacity-100 cursor-pointer' : ' cursor-not-allowed opacity-50']">
                            <BIcon  :class="[action.color === 'error' ? 'fill-error' : 'fill-primary']" class="  w-6 h-6"
                                :icon="action.icon" weight="fill" />
                            <div class=" text-center text-on-surface text-[10px] select-none">{{ action.title }}
                            </div>
                        </div>
                    </div>
                    <div class=" w-full ">
                        <div class=" h-0.5 bg-surface-variant rounded-full w-full"></div>
                    </div>
                    <div class=" w-full flex flex-col gap-y-4 py-4">
                        <div v-for="(info, index) in displayedInfo" :key="index"
                            class=" w-full flex flex-col select-none gap-y-1">
                            <div v-loading="isLoading" class=" text-body-sm text-on-surface/50">{{ info.title }}</div>
                            <div v-loading="isLoading" class=" text-body-md text-on-surface">{{ info.value }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, type PropType, ref, watch, onMounted } from 'vue';
import type { Contact } from '~/types/chat';
import { useRoute, useRouter } from 'vue-router';
import { useDate, useI18n, useProfileStore } from '#imports';
import profileBackground from '/images/chat/profile-background.webp'

interface Action {
    title: string;
    icon: string;
    key: 'end' | 'refer' | 'voice-call' | 'video-call';
    active: boolean | null;
    color?: string;
}

export default defineComponent({
    name: 'ChatProfileOverview',
    props: {
        profile: {
            type: Object as PropType<Contact | null>,
            required: true,
        }
    },
    setup(props) {
        const { getYearsPassed } = useDate()
        const router = useRouter()
        const route = useRoute()
        const { t } = useI18n()
        const profileStore = useProfileStore()

        const role = computed(() => profileStore.chosenRole)


        const mockProfile = ref<Contact>(
            {
                id: 1,
                name: "امیر",
                lastName: "سعیدی",
                isOnline: true,
                lastSeen: new Date(),
                imageUrl: "https://i.pravatar.cc/150?u=1",
                isActive: false,
                unreadCount: 2,
                serviceType: "chat",
                birthDate: new Date(),
                phoneNumber: "09134168227",
                nationalCode: "1235678901",
                lastMessage: {
                    id: 101,
                    conversationId: 1,
                    date: new Date(new Date().getTime() - 1000 * 60 * 5),
                    type: "text",
                    text: "سلام، وقت بخیر؟",
                    senderId: 1,
                    isEdited: false,
                    isSent: true,
                    isRead: false,
                },
            },
        )

        const isOpen = ref(false)
        const localProfile = ref<Contact>(
            mockProfile.value
        )

        onMounted(() => {
            console.log('mount')
        })

        const actionButtons = computed((): Action[] => [
            {
                title: t('chat.options.end'),
                icon: 'PhX',
                active: localProfile.value == undefined ? false : localProfile.value?.isActive,
                key: 'end',
                color: 'error'
            },
            {
                title: t('chat.options.refer'),
                icon: 'PhTreeStructure',
                active: localProfile.value == undefined ? false : localProfile.value?.isActive,
                key: 'refer'
            },
            {
                title: t('chat.options.voiceCall'),
                icon: 'PhPhoneCall',
                active: localProfile.value == undefined ? false : localProfile.value?.isActive && (localProfile.value.serviceType !== 'chat'),
                key: 'voice-call'
            },
            {
                title: t('chat.options.videoCall'),
                icon: 'PhVideoCamera',
                active: localProfile.value == undefined ? false : localProfile.value?.isActive && localProfile.value.serviceType === 'video-call',
                key: 'video-call'
            },
        ])

        // Watch the route query to open/close
        watch(() => route.query.view, (newView) => {
            if (newView === 'profile') {
                // FIX: Populate local data immediately when opening 
                // This prevents the blank screen when reopening the same profile
                if (props.profile) {
                    localProfile.value = props.profile
                }
                isOpen.value = true
            } else {
                isOpen.value = false
                // Wait for animation to finish before clearing local data
                setTimeout(() => {
                    // Only clear if the sidebar is still closed (prevents race conditions)
                    if (!isOpen.value) {
                        localProfile.value = mockProfile.value
                    }
                }, 300)
            }
        }, { immediate: true })

        // Update localProfile if the user switches chats while the sidebar is already open
        watch(() => props.profile, (newVal) => {
            if (newVal) {
                localProfile.value = newVal
            }
        })

        const isLoading = computed(() => props.profile === null)


        const closeSidebar = () => {
            router.back()
        }

        const showPersonalInfo = computed(() => role.value !== 'user')

        const handleAction = (action: Action) => {
            if (!action.active) return
            switch (action.key) {
                case 'end':

                    break;
                case 'refer':

                    break;
                case 'voice-call':

                    break;
                case 'video-call':

                    break;
            }
        }

        const displayedInfo = computed(() => {
            let items = [
                {
                    title: t('chat.info.nationalCode'),
                    value: localProfile.value?.nationalCode,
                    canDisplay: showPersonalInfo.value
                },
                {
                    title: t('chat.info.phoneNumber'),
                    value: localProfile.value?.phoneNumber,
                    canDisplay: showPersonalInfo.value
                },
                {
                    title: t('chat.info.age'),
                    value: getYearsPassed(localProfile.value?.birthDate || new Date()),
                    canDisplay: true
                },
            ]

            return items.filter((item) => item.canDisplay)
        })


        return {
            isOpen,
            localProfile,
            t,
            closeSidebar,
            profileBackground,
            actionButtons,
            handleAction,
            displayedInfo,
            showPersonalInfo,
            isLoading,
        }

    }
})
</script>