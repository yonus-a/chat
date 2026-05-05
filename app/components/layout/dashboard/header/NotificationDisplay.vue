<template>
    <div class=" cursor-pointer py-4 px-5 w-full  transition-all select-none flex flex-col gap-y-2 duration-200 ease-in-out"
        :class="[active ? ' bg-surface-variant' : ' bg-surface-variant/0']">
        <div class=" flex items-center select-none text-on-surface/50 shrink-0 text-body-sm gap-x-2">
            <div class=" flex items-center gap-x-1">
                <BIcon v-loading="isLoading" class=" w-4.5 h-4.5" icon="PhClock" />
                <div v-loading="isLoading">{{ getAbsoluteDateTime(notification.date) }}</div>
            </div>
            <div class=" flex items-center gap-x-1" :class="[tagColoring.text]">
                <BIcon v-loading="isLoading" class=" w-4.5 h-4.5"  :icon="tagIcon" />
                <div v-loading="isLoading" >{{ tagText }}</div>
            </div>
        </div>
        <div v-loading="isLoading" class=" text-label-lg text-on-surface shrink-0">{{ notification.title }}</div>
        <p v-loading="isLoading"
            class=" w-full line-clamp-3 overflow-hidden text-ellipsis text-on-surface text-body-sm shrink-0 text-justify select-none">
            {{ notification.description }}
        </p>
        <div v-show="notification.isRead" class=" w-full flex justify-end items-end flex-1">
            <div class=" text-primary select-none text-label-sm flex items-center justify-center gap-x-1">
                <div v-loading="isLoading">{{ t('notifications.seen') }}</div>
                <BIcon v-loading="isLoading" class=" w-5 h-5" icon="PhCheck" />
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue';
import type { Notification } from '~/types/notification';
import { useI18n } from '#imports';
import { useDate } from '#imports';
export default defineComponent({
    name: 'NotificationDisplay',
    props: {
        notification: {
            type: Object as PropType<Notification>,
            required: true,
        },
        loading: {
            type: Boolean,
            default: true,
        },
        active: {
            type: Boolean,
            default: false,
        }
    },
    setup(props) {
        const { getAbsoluteDateTime } = useDate()
        const { t } = useI18n()
        const isLoading = computed(() => props.loading)


        const tagText = computed(() => {
            switch (props.notification.tag) {
                case 'announcement':
                    return t('notifications.types.announcement')
                case 'reminder':
                    return t('notifications.types.reminder')
                case 'request':
                    return t('notifications.types.request')
                case 'wallet':
                    return t('notifications.types.wallet')
            }
        })

        const tagIcon = computed(() => {
            switch (props.notification.tag) {
                case 'announcement':
                    return 'PhMegaphone'
                case 'reminder':
                    return 'PhHourglass'
                case 'request':
                    return 'PhCardsThree'
                case 'wallet':
                    return 'PhWallet'
            }
        })

        const tagColoring = computed(() => {
            let type = props.notification.tag
            switch (type) {
                case 'announcement':
                    return {
                        text: 'text-on-surface/50',
                        icon: 'text-on-surface/50' // Change fill- to text-
                    }
                case 'reminder':
                    return {
                        text: 'text-error',
                        icon: 'text-error' // 'fill-color' was likely a typo anyway
                    }
                case 'request':
                    return {
                        text: 'text-primary',
                        icon: 'text-primary' // Change fill- to text-
                    }
                case 'wallet':
                    return {
                        text: 'text-[#45A3EB]',
                        icon: 'text-[#45A3EB]' // Change fill- to text-
                    }
            }
        })

        return {
            t,
            tagIcon,
            getAbsoluteDateTime,
            tagText,
            tagColoring,
            isLoading,
        }
    }
})
</script>