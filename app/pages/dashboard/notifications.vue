<template>
    <div class=" border-b border-b-outline-variant flex flex-col w-full h-dvh bg-surface">
        <div class=" w-full shrink-0 h-16 flex justify-between items-center px-5">
            <div></div>
            <div class=" select-none text-on-surface text-body-sm">{{ t('notifications.title') }}</div>
            <BIcon icon="PhArrowLeft" class=" cursor-pointer w-5 h-5 fill-on-surface" @click="goBack" />
        </div>
        <div class=" w-full flex-1 "></div>
    </div>
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useI18n } from '#imports';
import { useNotificationsStore } from '#imports';
import { useRouter } from 'vue-router';
export default defineComponent({
    name: 'NotificationsPage',
    setup() {
        const router = useRouter()
        const { t } = useI18n()
        const notificationsStore = useNotificationsStore()
        const isLoading = computed(() => notificationsStore.isLoading)
        const notifications = computed(() => notificationsStore.displayedNotifications)

        const goBack = () => {
            router.go(-1)
        }

        return {
            t,
            goBack,
            isLoading,
            notifications,
        }
    }
})
</script>