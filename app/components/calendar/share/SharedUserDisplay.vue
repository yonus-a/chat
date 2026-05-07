<template>
    <div class="w-full transition-all duration-[400ms] ease-in-out"
        :class="[isDeleting ? 'max-h-0 opacity-0 mb-0 overflow-hidden' : 'max-h-20 opacity-100 mb-1.5 overflow-visible']">
        <div class=" w-full flex justify-between whitespace-nowrap text-wrap items-center">
            <div :class="[sending ? 'opacity-50' : 'opacity-100']"
                class=" transition-all duration-200 ease-in-out flex items-center gap-x-2">
                <div class=" w-10  h-10 rounded-full overflow-hidden">
                    <div class=" w-10 h-10 " v-loading="isLoading">
                        <BImage :src="user.imageUrl"
                            class=" w-full h-full min-w-full min-h-full max-w-full max-h-full" />
                    </div>
                </div>
                <div class=" select-none text-label-md text-on-surface" v-loading="isLoading">{{ user.name }} {{
                    user.lastName }}</div>
            </div>
            <BMenu @select="handleMenuClick" :options="menuOptions" v-show="!inProgress">
                <template #trigger="{ isOpen }">
                    <div v-loading="isLoading" class=" flex items-center gap-x-2 cursor-pointer select-none">
                        <div class=" text-body-sm text-on-surface/50">{{ currentType }}</div>
                        <BIcon icon="PhCaretDown"
                            class=" transition-all duration-200 ease-in-out fill-on-surface/50 w-4.5 h-4.5"
                            :class="[isOpen ? ' rotate-180' : ' rotate-0']" />
                    </div>
                </template>
            </BMenu>
            <BIcon icon="PhCircleNotch" class=" fill-on-surface/50 w-5 h-5 animate-spin" v-if="inProgress" />
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue';
import type { SharedUserCalendar, ShareTypes } from '~/types/calendar';
import { useI18n, useCalendarStore } from '#imports';
import type { MenuOption } from '~/types/components/menu-options';


export default defineComponent({
    name: 'SharedUserDisplay',
    props: {
        user: {
            type: Object as PropType<SharedUserCalendar>,
            required: true,
        },
        loading: {
            type: Boolean,
            default: true,
        },
        sending: {
            type: Boolean,
            default: false,
        },
        isDeleting: { type: Boolean, default: false }
    },
    setup(props) {
        const calendarStore = useCalendarStore()
        const isSending = computed(() => props.sending)
        const isLoading = computed(() => props.loading)
        const { t } = useI18n()

        const inProgress = computed(() => isSending.value || props.isDeleting)

        const currentType = computed(() => getAccessTypeTitles(props.user.accessType))
        const getAccessTypeTitles = (key: ShareTypes) => {
            return menuOptions.value.find((option) => option.key === key)?.label
        }

        const menuOptions = computed<MenuOption[]>(() => [
            {
                key: 'viewer',
                label: t('calendar.share.types.viewer'),
            },
            {
                key: 'editor',
                label: t('calendar.share.types.editor'),
            },
            {
                key: 'delete',
                label: t('calendar.share.types.delete'),
                color: 'error'
            },
        ])

        const handleMenuClick = async (key: string) => {
            if (key === 'delete') {
                await calendarStore.removeSharedUser(props.user.id);
            } else if (key === 'viewer' || key === 'editor') {
                await calendarStore.updateAccessType(props.user.id, key as ShareTypes);
            }
        };




        return {
            getAccessTypeTitles,
            menuOptions,
            currentType,
            handleMenuClick,
            isSending,
            inProgress,
            isLoading,
        }
    }
})
</script>