<template>
    <div class=" bg-surface w-dvw h-dvh overflow-hidden flex items-center">
        <div class=" md:block hidden shrink-0 h-full">
            <SideBar />
        </div>
        <div class="flex-1 h-full flex flex-col min-w-0">
            <div v-if="hasHeader" class=" w-full shrink-0">
                <DashboardHeader />
            </div>
            <div ref="pageContainer" @scroll="handleScroll" class="flex-1 w-full overflow-y-auto">
                <div class=" h-full w-full" :class="[hasHeader ? 'px-3 md:px-8 py-6' : '']">
                    <NuxtPage />
                </div>
            </div>
            <div class=" h-16 w-full" v-if="shouldShowBottomNav"></div>
        </div>
        <MobileNavigation v-if="shouldShowBottomNav" />
    </div>
</template>
<script lang="ts" setup>
import SideBar from '~/components/layout/dashboard/SideBar.vue';
import DashboardHeader from '~/components/layout/dashboard/DashboardHeader.vue';
import MobileNavigation from '~/components/layout/dashboard/MobileNavigation.vue';
const profileStore = useProfileStore()
const storiesStore = useStoriesStore()
const route = useRoute()
const { shouldShowBottomNav } = useNavigation()
const hasHeader = computed(() => !route.path.startsWith('/dashboard/chat'))
const pageContainer = ref<HTMLElement | null>(null)

const lastScrollY = ref(0);
const scrollThreshold = 10;

const handleScroll = () => {
    const currentScrollY = pageContainer.value?.scrollTop;

    if (!currentScrollY) return
    if (currentScrollY > lastScrollY.value + scrollThreshold && storiesStore.isStoriesOpen) {
        storiesStore.isStoriesOpen = false;
    }

    lastScrollY.value = currentScrollY;
};


onBeforeMount(() => {
    profileStore.loadUserProfile()
})
</script>