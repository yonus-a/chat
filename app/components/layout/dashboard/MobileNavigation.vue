<template>
    <ClientOnly>
        <Teleport to="body">
            <div
                class="fixed bottom-0 inset-x-0 h-14 shadow-medium gap-x-2 w-full bg-surface z-50 lg:hidden py-1 px-3 flex items-center justify-between">
                <div @click="openRoute(route.route)" v-for="route in routes" :key="route.key" class="basis-1/5 h-full">
                    <div class="h-full w-full rounded-xl flex-col gap-y-0.5 flex justify-center items-center transition-all duration-200 ease-in-out cursor-pointer select-none"
                        :class="[isRouteActive(route.route) ? 'bg-primary/10' : 'bg-primary/0']">
                        <BIcon :icon="route.icon" class="w-5 h-5 transition-all duration-200 ease-in-out"
                            :class="[isRouteActive(route.route) ? 'fill-primary' : 'fill-on-surface/50']" />
                        <div class="select-none text-on-surface text-[10px]">{{ route.label }}</div>
                    </div>
                </div>

                <div @click="openRoute(localePath('/dashboard/profile'))"
                    class="h-full flex-col gap-y-0.5 basis-1/5 aspect-square flex items-center justify-center cursor-pointer">
                    <div class="w-5 h-5 rounded-full overflow-hidden border border-outline/20">
                        <BImage :src="profileImage" class="w-full h-full object-cover" />
                    </div>
                    <div class="select-none text-on-surface text-[10px]">{{ t('sidebar.profile') }}</div>
                </div>

                <NuxtLinkLocale to="/dashboard/services" class="flex items-center justify-center">
                    <BButton icon="PhPlus" size="sm" />
                </NuxtLinkLocale>
            </div>
        </Teleport>
    </ClientOnly>
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
            // {
            //     key: 'services',
            //     icon: 'PhPlus',
            //     route: localePath('/dashboard/services')
            // },
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
            localePath,
            openRoute,
            profileImage,
            t,
        }
    }
})
</script>