<template>
    <div class=" w-full h-full">
        <div v-if="canShow">
            <div class=" flex items-center select-none text-on-surface/50 shrink-0 text-body-sm gap-x-2">
                <div class=" flex items-center gap-x-1">
                    <BIcon v-loading="isLoading" class=" w-4.5 h-4.5" icon="PhClock" />
                    <div v-loading="isLoading">{{ getAbsoluteDateTime(notification.date) }}</div>
                </div>
                <div class=" flex items-center gap-x-1">
                    <BIcon v-loading="isLoading" class=" w-4.5 h-4.5" :icon="tagIcon" />
                    <div v-loading="isLoading">{{ tagText }}</div>
                </div>
            </div>
            <div v-loading="isLoading" class=" mt-3 text-label-lg text-on-surface shrink-0">{{ notification.title }}
            </div>
            <p v-loading="isLoading"
                class=" w-full line-clamp-3 overflow-hidden mt-2 text-ellipsis text-on-surface/80 text-body-sm shrink-0 text-justify select-none">
                {{ notification.description }}
            </p>
        </div>
        <div v-else class=" w-full h-full flex items-center justify-center">
            <NoDataDisplay :image-path="NoNotificationSelected" :title="t('notifications.noNotificationSelected')" />
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useNotificationsStore, useDate, useI18n } from '#imports';
import type { Notification } from '~/types/notification';
import NoDataDisplay from '~/components/general/NoDataDisplay.vue';
import NoNotificationSelected from '/images/dashboard/no-notification-selected.webp'
definePageMeta({
    hideBottomNav: true
})
export default defineComponent({
    name: 'NotificationDetails',
    props: {
        canShow: {
            type: Boolean,
            default: false,
        }
    },
    components: {
        NoDataDisplay,
    },
    setup(props) {
        const { getAbsoluteDateTime } = useDate();
        const { t } = useI18n();
        const route = useRoute();
        const notificationsStore = useNotificationsStore();

        const localLoading = ref(false);

        // 1. Initialize as the mock notification to support immediate skeleton UI
        const notification = ref<Notification>(notificationsStore.mockNotification);



        // 2. The unified fetch and set logic
        const syncNotificationData = async () => {
            const id = Number(route.params.id);
            if (!id) return;

            // Reset to mock whenever we switch IDs to trigger skeletons
            notification.value = notificationsStore.mockNotification;
            localLoading.value = true;

            try {
                // First: Check if it already exists in the store array
                const existing = notificationsStore.notifications.find(n => n.id === id);

                if (existing) {
                    notification.value = existing;
                } else {
                    // Second: Fetch from API (Mock) and set the ref directly
                    const fetched = await notificationsStore.fetchNotificationById(id);
                    if (fetched) {
                        notification.value = fetched;
                    }
                }
            } catch (error) {
                console.error("Failed to load notification:", error);
            } finally {
                localLoading.value = false;
            }
        };

        // 3. Handle Lifecycle
        onMounted(() => {
            if (props.canShow) {
                syncNotificationData();
            }
        });

        // 4. Handle Route Changes (User clicking different items in the list)
        watch(() => route.params.id, (newId) => {
            if (newId) {
                syncNotificationData();
            }
        });

        // --- Computed UI Helpers ---
        const tagText = computed(() => {
            if (!notification.value || notification.value.id <= 0) return '';
            return t(`notifications.types.${notification.value.tag}`);
        });

        const tagIcon = computed(() => {
            const icons: Record<string, string> = {
                announcement: 'PhMegaphone',
                reminder: 'PhHourglass',
                request: 'PhCardsThree',
                wallet: 'PhWallet'
            };
            return icons[notification.value?.tag] || '';
        });

        return {
            tagIcon,
            tagText,
            getAbsoluteDateTime,
            isLoading: localLoading,
            notification,
            NoNotificationSelected,
            t,
        }
    }
})
</script>