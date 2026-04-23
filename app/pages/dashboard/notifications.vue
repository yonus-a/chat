<template>
    <div class=" w-full h-full flex items-stretch center gap-x-6">
        <div class="flex flex-col h-full basis-full md:basis-1/2 min-w-0">
            <div class="w-full flex-1 flex flex-col overflow-hidden md:border md:rounded-xl md:border-outline-variant">

                <div
                    class="select-none md:flex hidden bg-surface border-b border-b-outline-variant items-center justify-between p-5">
                    <div class="text-on-surface text-label-lg">{{ t('notifications.title') }}</div>
                    <BButton size="sm" @click="markAllAsRead" :loading="isMarkingAllAsRead" type="ghost"
                        :text="t('sidebar.readAll')" right-icon="PhChecks" />
                </div>

                <div v-if="notifications.length > 0 || isLoading" class="w-full flex-1 overflow-hidden relative">
                    <BVirtualVerticalList :pagination="isMobile" :scrollbar="!isMobile && !showLoading"
                        :items="notifications" :loading="showLoading" :has-next-page="hasNextPage"
                        @load-more="notificationsStore.loadNextPage">
                        <template #item="{ item }">
                            <NotificationDisplay :loading="showLoading" :notification="item"
                                @click="handleNotificationClick(item)" />
                        </template>
                    </BVirtualVerticalList>
                </div>
            </div>
            <div class=" w-full pt-5 shrink-0 hidden md:flex items-center justify-center">
                <BPagination v-model="desktopCurrentPage" :max-pages="maxPages" />
            </div>
        </div>
        <div class=" p-4 h-full md:block hidden md:basis-1/2 bg-surface-variant rounded-3xl">
            <NuxtPage v-slot="{ Component }">
                <component :is="Component" />
            </NuxtPage>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue';
import { useI18n, useNotificationsStore, useWindowSize, useLocalePath } from '#imports';
import { useRouter } from 'vue-router';
import NotificationDisplay from '~/components/layout/dashboard/header/NotificationDisplay.vue';
import NoDataDisplay from '~/components/general/NoDataDisplay.vue';
import NoData from '/images/dashboard/no-notifications.webp'

definePageMeta({
    layout: 'responsive',
    layoutTransition: false,
    headerTitle: 'notifications.title',
    backPath: '/dashboard'
});

export default defineComponent({
    name: 'NotificationsPage',
    components: {
        NotificationDisplay,
        NoDataDisplay,
    },
    setup() {
        const router = useRouter();
        const localePath = useLocalePath();
        const { t } = useI18n();
        const { width } = useWindowSize();
        const notificationsStore = useNotificationsStore();

        // 1. Unified State from Store
        const isMobile = computed(() => width.value <= 768);
        const maxPages = computed(() => notificationsStore.maxPages);
        const isLoading = computed(() => notificationsStore.isLoading);
        const isMarkingAllAsRead = computed(() => notificationsStore.isMarkingAllAsRead);
        const hasNextPage = computed(() => notificationsStore.hasNextPage);

        // 2. Writable Computed for Pagination (Cleanest Practice)
        const desktopCurrentPage = computed({
            get: () => notificationsStore.currentPage,
            set: (val) => notificationsStore.fetchNotifications(val)
        });

        // 3. Dynamic Notifications Source
        const notifications = computed(() => {
            return isMobile.value
                ? notificationsStore.displayedNotifications // Flat list for mobile
                : notificationsStore.getDesktopPageItems;   // Paginated for desktop
        });

        // 4. Unified Loading Logic
        const showLoading = computed(() => {
            // For mobile, only show global loader/skeleton on first page
            if (isMobile.value) {
                return isLoading.value && notificationsStore.currentPage === 1;
            }
            // For desktop, show loader whenever switching pages
            return isLoading.value;
        });

        const markAllAsRead = () => notificationsStore.markAllAsRead();

        const handleNotificationClick = (notification: any) => {
            if (isLoading.value && notificationsStore.currentPage === 1) return;
            router.push(localePath(`/dashboard/notifications/${notification.id}`));
        };

        onMounted(() => {
            // Always attempt to fetch page 1. 
            // The Pinia store "Circuit Breaker" handles whether it actually hits the API.
            notificationsStore.fetchNotifications(1);
        });

        return {
            t,
            notifications,
            hasNextPage,
            notificationsStore,
            handleNotificationClick,
            showLoading,
            NoData,
            markAllAsRead,
            isMarkingAllAsRead,
            isLoading,
            desktopCurrentPage,
            maxPages,
            isMobile,
        };
    }
})
</script>