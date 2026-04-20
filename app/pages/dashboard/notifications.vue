<template>
    <div class="flex flex-col w-full h-dvh bg-surface">
        <div class="w-full shrink-0 h-16 flex justify-between items-center px-5 border-b border-b-outline-variant">
            <div class="w-5"></div>
            <div class="select-none text-on-surface text-label-lg font-bold">{{ t('notifications.title') }}</div>
            <BIcon icon="PhArrowLeft" class="cursor-pointer w-6 h-6 fill-on-surface" @click="goBack" />
        </div>

        <div class="w-full flex-1 overflow-hidden">
            <BVirtualVerticalList v-if="notifications.length > 0 || isLoading" :items="notifications"
                :loading="isLoading" :has-next-page="hasNextPage" @load-more="notificationsStore.loadNextPage">
                <template #item="{ item }">
                    <NotificationDisplay :loading="isLoading && item.id <= 0" :notification="item"
                        @click="handleNotificationClick(item)" />
                </template>
            </BVirtualVerticalList>

            <div v-else class="h-full w-full flex items-center justify-center">
                <NoDataDisplay :image-path="NoData" :title="t('notifications.noNotifications')" />
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, computed, onMounted, watch } from 'vue';
import { useI18n } from '#imports';
import { useNotificationsStore } from '#imports';
import { useRouter } from 'vue-router';
import type { Notification } from '~/types/notification';
import NotificationDisplay from '~/components/layout/dashboard/header/NotificationDisplay.vue';
import { useWindowWidth } from '#imports';
import NoDataDisplay from '~/components/general/NoDataDisplay.vue';
import NoData from '/images/dashboard/no-notifications.webp'

export default defineComponent({
    name: 'NotificationsPage',
    components: {
        NotificationDisplay,
        NoDataDisplay,
    },
    setup() {
        const router = useRouter();
        const { t } = useI18n();
        const notificationsStore = useNotificationsStore();
        const { width } = useWindowWidth()

        watch(() => width.value, () => {
            if (width.value > 768) {
                router.go(-1)
            }
        })

        // Store Bindings
        const isLoading = computed(() => notificationsStore.isLoading);
        const notifications = computed(() => notificationsStore.displayedNotifications);
        const hasNextPage = computed(() => notificationsStore.hasNextPage);
        const currentPage = computed(() => notificationsStore.currentPage)

        const goBack = () => {
            router.go(-1);
        };

        const handleNotificationClick = (notification: Notification) => {
            if (isLoading.value && currentPage.value === 1) return
            /// handle what happens next based on notification
        };

        onMounted(() => {
            notificationsStore.fetchNotifications(1);
        });

        return {
            t,
            goBack,
            isLoading,
            notifications,
            hasNextPage,
            notificationsStore,
            handleNotificationClick,
            NoData,
        };
    }
})
</script>