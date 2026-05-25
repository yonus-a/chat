<template>
    <div class=" bg-surface w-dvw h-dvh overflow-hidden flex ">
        <div class=" md:block hidden shrink-0 h-full">
            <SideBar />
        </div>
        <div class="flex-1 h-full  flex flex-col min-w-0" :class="[shouldShowBottomNav ? ' max-[768px]:max-h-[calc(100vh-56px)]' : 'max-h-full']">
            <div ref="pageContainer" class="flex-1 w-full overflow-y-auto">
                <div class=" h-full w-full">
                    <NuxtPage />
                </div>
            </div>
        </div>
        <MobileNavigation v-if="shouldShowBottomNav" />
    </div>
</template>
<script lang="ts" setup>
import SideBar from '~/components/layout/dashboard/SideBar.vue';
import MobileNavigation from '~/components/layout/dashboard/MobileNavigation.vue';
const profileStore = useProfileStore()
const { shouldShowBottomNav } = useNavigation()
const pageContainer = ref<HTMLElement | null>(null)

onBeforeMount(() => {
    profileStore.loadUserProfile()
})
</script>