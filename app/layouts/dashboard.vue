<template>
    <div class=" bg-surface w-dvw h-dvh overflow-hidden flex items-center">
        <div class=" lg:block hidden shrink-0 h-full">
            <SideBar />
        </div>
        <div class=" flex-1 h-full flex flex-col">
            <div v-if="hasHeader" class=" w-full shrink-0">
                <DashboardHeader />
            </div>
            <div class="  flex-1 w-full overflow-y-auto">
                <div class="  w-full" :class="[hasHeader ? 'px-3 md:px-8 py-6' : '']">
                    <NuxtPage />
                </div>
            </div>
        </div>
        <MobileNavigation />
    </div>
</template>
<script lang="ts" setup>
import SideBar from '~/components/layout/dashboard/SideBar.vue';
import DashboardHeader from '~/components/layout/dashboard/DashboardHeader.vue';
import MobileNavigation from '~/components/layout/dashboard/MobileNavigation.vue';
const profileStore = useProfileStore()
const route = useRoute()

const hasHeader = computed(() => !route.path.startsWith('/dashboard/chat'))

onBeforeMount(() => {
    profileStore.loadUserProfile()
})
</script>