<template>
    <Teleport to="body">
        <div
            class=" fixed h-14 shadow-medium gap-x-2 bottom-0 left-0 w-dvw bg-surface z-50 px-3 flex items-center justify-between">
            <div @click="openRoute(route.route)" v-for="route in routes" :key="route.key">
                <div v-if="route.label && route.label.trim().length > 0"
                    class=" h-14 aspect-square flex justify-center items-center cursor-pointer select-none">
                    <BIcon :icon="route.icon" class=" w-5 h-5 transition-all duration-200 ease-in-out"
                        :class="[isRouteActive(route.route) ? ' fill-primary' : ' fill-on-surface/50']" />
                </div>
                <BButton v-else :icon="route.icon" />
            </div>
            <div @click="openRoute('/dashboard/profile')" class=" h-14 aspect-square flex items-center justify-center">
                <div class=" w-5 h-5 rounded-full overflow-hidden">
                    <BImage :src="profileImage" class=" w-full h-full min-w-full min-h-full max-w-full max-h-full" />
                </div>
            </div>
        </div>
    </Teleport>
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useI18n, useLocalePath } from '#imports';
import { useRoute, useRouter } from 'vue-router';
import { useProfileStore } from '#imports';
export default defineComponent({
    name: 'MobileNavigation',
    setup() {
        const profileStore = useProfileStore()
        const { t } = useI18n()
        const localePath = useLocalePath()
        const route = useRoute()
        const router = useRouter()

        const routes = computed(() => [
            {
                key: 'home',
                label: t("sidebar.dashboard"),
                icon: "PhHouseSimple",
                route: localePath('/dashboard')
            },
            {
                key: 'calendar',
                label: t("sidebar.calendar"),
                icon: "PhCalendarDots",
                route: localePath('/dashboard/calendar')
            },
            {
                key: 'services',
                icon: 'PhPlus',
                route: localePath('/dashboard/services')
            },
            {
                key: "chat",
                label: t("sidebar.chat"),
                icon: "PhChatCircleDots",
                route: localePath('/dashboard/chat')
            },
        ])

        const isRouteActive = (path: string) => {
            return path === route.path
        }

        const profileImage = computed(() => profileStore.userData.imageUrl)

        const openRoute = (path: string) => {
            router.push(path)
        }

        return {
            isRouteActive,
            routes,
            openRoute,
            profileImage,
        }
    }
})
</script>