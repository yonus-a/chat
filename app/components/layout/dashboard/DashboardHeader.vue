<template>
    <div class="border-b border-b-outline/50 md:py-0 py-3 transition-all duration-300">
        <div :class="[isStoriesOpen ? 'pb-0 pt-3' : 'py-3']"
            class=" w-full px-4 md:py-0 md:px-8 md:h-17.25 flex items-center justify-between md:justify-end gap-x-3 md:gap-x-4">

            <div class=" hidden md:flex items-center h-full gap-x-3">
                <div class=" h-13 overflow-hidden">
                    <BInput v-model="searchText" @submit="initSearch" icon="PhMagnifyingGlass"
                        :placeholder="t('general.search')" />
                </div>
                <BButton icon="PhPlus" />
            </div>

            <!-- MOBILE RIGHT GROUP: Hamburger -> Stories -> Title -->
            <div class=" md:hidden flex items-center cursor-pointer" @click="toggleStories">

                <!-- 1. Hamburger -->
                <div class=" w-10 aspect-square flex items-center shrink-0">
                    <BIcon icon="PhList" class=" w-6 h-6 fill-on-surface" />
                </div>

                <!-- 2. CLOSED OVERLAPPING STORIES (Now in the middle) -->
                <!-- Dynamic margins: When opened, width drops to 0, margin-right drops to 0, leaving exactly 8px (ml-2) before the title -->
                <div v-if="stories.length > 0"
                    class="flex items-center transition-all duration-300 ease-in-out overflow-hidden"
                    :class="isStoriesOpen ? 'max-w-0 opacity-0 mr-0 ml-2' : 'max-w-25 opacity-100 mr-2 ml-2'">
                    <div class="flex items-center">
                        <StoryDisplay v-for="(story, index) in stories.slice(0, 3)" :key="'closed-' + story.id"
                            :story="story" size="sm" :can-open="false" class="relative" :style="{ zIndex: 10 - index }"
                            :class="index !== 0 ? '-mr-2.5' : ''" />
                    </div>
                </div>

                <!-- 3. Route Title -->
                <!-- Added a fallback margin just in case there are 0 stories so it still stays 8px away -->
                <div class=" text-body-sm select-none text-on-surface shrink-0 transition-transform duration-300"
                    :class="stories.length === 0 ? 'mr-2' : ''">
                    {{ routeTitle }}
                </div>

            </div>

            <!-- MOBILE LEFT GROUP (Notifications, Search) & Desktop Right -->
            <div class=" flex items-center gap-x-3 md:gap-x-4 shrink-0">
                <NuxtLinkLocale class=" md:block hidden">

                </NuxtLinkLocale>
                <NuxtLinkLocale to="/dashboard/chat"
                    class="w-10 h-10  md:flex hidden  items-center justify-center cursor-pointer relative">
                    <div v-if="unreadMessages > 0"
                        class="rounded-full min-w-6 h-4.5 px-1 text-white select-none bg-gradient-error flex justify-center items-center absolute z-10 ltr:left-0 rtl:right-0 top-0 border-2 border-surface">
                        <div class="text-[10px] font-bold">{{ unreadMessages }}</div>
                    </div>
                    <BButton type="ghost" icon="PhChatText" />
                </NuxtLinkLocale>
                <NuxtLinkLocale class=" md:block hidden" to="/dashboard/calendar">
                    <BButton type="ghost" icon="PhCalendarDots" />
                </NuxtLinkLocale>
                <DashboardNotifications />
                <div @click="openSearch" class=" cursor-pointer w-10 h-10 md:hidden flex items-center justify-center">
                    <BIcon icon="PhMagnifyingGlass" class=" fill-on-surface/50 w-5 h-5" />
                </div>
                <div class=" w-10 aspect-square hidden md:flex justify-center items-center">
                    <div class=" cursor-pointer w-5 h-5 rounded-full overflow-hidden">
                        <BImage class=" w-full h-full min-w-full min-h-full max-w-full max-h-full"
                            :src="profileStore.userData.imageUrl" />
                    </div>
                </div>
            </div>
        </div>

        <!-- OPENED STATE: Large stories row with horizontal scroll -->
        <div class="md:hidden w-full transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] overflow-hidden"
            :class="isStoriesOpen ? 'max-h-25 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'">
            <div class="flex items-center gap-x-2 px-4 overflow-x-auto hide-scrollbar pb-2 pt-1 w-full">
                <!-- shrink-0 prevents flexbox from squishing them below 60px -->
                <StoryDisplay v-for="story in stories" :key="'open-' + story.id" :story="story" size="lg"
                    class="shrink-0" />
            </div>
        </div>

        <DashboardGreetings class=" md:hidden" />
    </div>
</template>
<script lang="ts">
import { defineComponent, computed, ref } from 'vue'; // Added ref
import { useProfileStore, useChatStore, useStoriesStore, useI18n, useRoute } from '#imports';
import DashboardGreetings from '~/components/dashboard/DashboardGreetings.vue';
import DashboardNotifications from './header/DashboardNotifications.vue';
import StoryDisplay from './story/StoryDisplay.vue';
export default defineComponent({
    name: 'DashboardHeader',
    components: {
        DashboardGreetings,
        DashboardNotifications,
        StoryDisplay,
    },
    setup() {
        const route = useRoute()
        const profileStore = useProfileStore()
        const storiesStore = useStoriesStore()
        const chatStore = useChatStore()
        const stories = computed(() => storiesStore.stories)
        const { t } = useI18n()
        const unreadMessages = computed(() => chatStore.unreadCount)




        const searchText = ref('')

        const isStoriesOpen = computed({
            get: () => storiesStore.isStoriesOpen,
            set: (val) => storiesStore.isStoriesOpen = val
        })

        const initSearch = () => { }
        const openSearch = () => { }

        const routeTitle = computed(() => {
            const metaTitle = route.meta.title
            return typeof metaTitle === 'string' ? t(metaTitle) : ''
        })

        const toggleStories = () => {
            isStoriesOpen.value = !isStoriesOpen.value
        }

        const closeStories = () => {
            if (isStoriesOpen.value) {
                toggleStories()
            }
        }




        return {
            t,
            searchText,
            closeStories,
            initSearch,
            routeTitle,
            profileStore,
            unreadMessages,
            openSearch,
            toggleStories,
            stories,
            isStoriesOpen // Exposed to template
        }
    }
})
</script>