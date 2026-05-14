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
            <div class=" flex items-center gap-x-2 justify-end">
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
                <BMenu @select="handleMenuClick" :options="secondMenuOptions" v-show="!inProgress">
                    <template #trigger>
                        <BIcon icon="PhDotsThreeVertical" class=" fill-on-surface/50 w-4.5 cursor-pointer h-4.5" />
                    </template>
                </BMenu>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue';
import type { CalendarAccess, ShareTypes } from '~/types/calendar';
import { useI18n, useCalendarStore } from '#imports';
import type { MenuOption } from '~/types/components/menu-options';
import { useEventBus } from '@vueuse/core';

export default defineComponent({
    name: 'SharedUserDisplay',
    props: {
        user: {
            type: Object as PropType<CalendarAccess>,
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
        isDeleting: { type: Boolean, default: false },
        eventId: {
            type: Number,
            default: null
        }
    },
    setup(props) {
        const calendarStore = useCalendarStore()
        const isSending = computed(() => props.sending)
        const isLoading = computed(() => props.loading)
        const { t } = useI18n()

        const inProgress = computed(() => isSending.value || props.isDeleting)

        const currentType = computed(() => getAccessTypeTitles(props.user.accessType))
        const getAccessTypeTitles = (key: ShareTypes) => {
            const option = menuOptions.value.find((opt) => String(opt.key).toLowerCase() === String(key).toLowerCase());
            return option ? option.label : t('calendar.share.types.viewer');
        }

        const menuOptions = computed<MenuOption[]>(() => [
            {
                key: 'viewer',
                label: t('calendar.share.types.viewer'),
                icon: 'PhEye'
            },
            {
                key: 'editor',
                label: t('calendar.share.types.editor'),
                icon: 'PhPencilSimpleLine'
            },
        ])

        const secondMenuOptions = computed<MenuOption[]>(() => [
            {
                key: 'delete',
                label: t('calendar.share.types.delete'),
                color: 'error',
                icon: 'PhTrash'
            },
        ])

        const handleMenuClick = async (key: string) => {
            const isEventMode = props.eventId !== null;
            const bus = useEventBus<any>('calendar-actions');

            if (key === 'delete') {
                if (isEventMode) {
                    bus.emit({ type: 'remove-event-user-ui', id: props.user.id });
                    bus.emit({ type: 'remove-event-access-master', eventId: props.eventId, userId: props.user.id });

                    await calendarStore.removeEventAccess(props.eventId!, props.user.id);
                } else {
                    await calendarStore.removeSharedUser(props.user.id);
                }
            } else if (key === 'viewer' || key === 'editor') {
                if (key === props.user.accessType) return;

                if (isEventMode) {
                    bus.emit({ type: 'update-event-access-master', eventId: props.eventId, userId: props.user.id, newAccess: key });
                    await calendarStore.updateEventAccess(props.eventId!, props.user.id, key as ShareTypes);
                    props.user.accessType = key as ShareTypes;
                } else {
                    await calendarStore.updateAccessType(props.user.id, key as ShareTypes);
                }
            }
        };


        return {
            getAccessTypeTitles,
            menuOptions,
            secondMenuOptions,
            currentType,
            handleMenuClick,
            isSending,
            inProgress,
            isLoading,
        }
    }
})
</script>