<template>
    <BMenu ref="menuRef" :overlay="false" class="flex items-center justify-center">
        <template #trigger="{ isOpen }">
            <div @click="handleTriggerClick" class="w-10 h-10 flex items-center justify-center cursor-pointer relative">
                <div v-if="!isLoading && unreadCount > 0"
                    class="rounded-full min-w-6 h-4.5 px-1 text-white select-none bg-gradient-error flex justify-center items-center absolute z-10 ltr:left-0 rtl:right-0 top-0 border-2 border-surface">
                    <div class="text-[10px] font-bold">{{ unreadCount }}</div>
                </div>
                <BIcon icon="PhBell" weight="fill" :class="[isOpen ? 'fill-primary' : 'fill-on-surface/50']"
                    class="w-5 h-5 transition-colors duration-200" />
            </div>
        </template>
        <div class=" h-auto max-h-[70vh] min-h-90 w-111 flex flex-col">
            <div class=" border-b border-b-outline-variant px-5 w-full shrink-0 h-18 flex items-center gap-x-4">
                <BIcon @click="closeNotifications" icon="PhX" class=" cursor-pointer fill-on-surface/50 w-6 h-6" />
                <div class=" select-none text-on-surface text-label-lg">{{ t('notifications.title') }}</div>
            </div>
            <div class=" w-full overflow-y-auto flex-1" v-if="notificationCount > 0 || isLoading">
                <NotificationDisplay :loading="isLoading" @click="handleNotificationClick(notification)"
                    v-for="notification in notifications" :key="notification.id" :notification="notification" />
            </div>
            <div v-else class=" w-full flex-1 flex items-center justify-center">
                <NoDataDisplay :image-path="NoData" :title="t('notifications.noNotifications')" />
            </div>
            <div v-if="notificationCount > 0 || isLoading"
                class=" w-full shrink-0 h-17 flex items-center justify-between border-t border-t-outline-variant px-5">
                <BButton size="sm" @click="markAllAsRead" :loading="isMarkingAllAsRead" type="ghost"
                    :text="t('sidebar.readAll')" right-icon="PhChecks" />
                <CardLink :title="t('general.viewAll')" to="/dashboard/notifications" />
            </div>
        </div>
    </BMenu>
</template>
<script lang="ts">
import { defineComponent, computed, onMounted, useTemplateRef } from 'vue';
import { useNotificationsStore } from '#imports';
import type { Menu } from '~/types/components/menu';
import CardLink from '~/components/general/CardLink.vue';
import { useI18n, useLocalePath } from '#imports';
import NotificationDisplay from './NotificationDisplay.vue';
import type { Notification } from '~/types/notification';
import NoData from '/images/dashboard/no-notifications.webp'
import NoDataDisplay from '~/components/general/NoDataDisplay.vue';
import { useWindowWidth } from '#imports';
export default defineComponent({
    name: 'DashboardNotifications',
    components: {
        NotificationDisplay,
        CardLink,
        NoDataDisplay,
    },
    setup() {
        const { t } = useI18n()
        const localePath = useLocalePath();
        const notificationsStore = useNotificationsStore();
        const notifications = computed(() => notificationsStore.displayedNotifications);
        const unreadCount = computed(() => notificationsStore.unreadCount);
        const notificationCount = computed(() => notifications.value.length)
        const menuRef = ref<Menu | null>(null);
        const isMarkingAllAsRead = computed(() => notificationsStore.isMarkingAllAsRead)
        const { width } = useWindowWidth();

        // 2. Compute isMobile based on the shared width
        const isMobile = computed(() => width.value < 768);

        const handleTriggerClick = (e: MouseEvent) => {
            if (isMobile.value) {
                e.stopImmediatePropagation();
                navigateTo(localePath('/dashboard/notifications'));
            }
        };

        const formatTime = (date: Date) => {
            return new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(date);
        };

        const closeNotifications = () => {
            menuRef.value?.close();
        }

        const isLoading = computed(() => notificationsStore.isLoading);

        onMounted(() => {
            notificationsStore.fetchNotifications();
        });

        const markAllAsRead = () => {
            notificationsStore.markAllAsRead()
        }


        const handleNotificationClick = (notification: Notification) => {
            if (isLoading.value) return
            // use the notification details to handle the action
        }




        return {
            formatTime,
            markAllAsRead,
            closeNotifications,
            unreadCount,
            notificationCount,
            t,
            isMarkingAllAsRead,
            notifications,
            handleNotificationClick,
            menuRef,
            isLoading,
            NoData,
            handleTriggerClick,
        }
    }
})
</script>