<template>
    <div @click.stop
        class=" p-1 text-wrap whitespace-normal md:p-6 cursor-default flex flex-col gap-y-3.5 w-dvw md:max-w-140">
        <div class=" hidden md:flex items-center gap-x-2">
            <BIcon v-for="action in actions" :key="action.key" :icon="action.icon" @click="handleAction(action.key)"
                class=" w-4 h-4 cursor-pointer fill-on-surface/50" />
        </div>

        <div class=" flex items-center gap-x-4.5">
            <div class=" w-4 h-4 rounded-sm" :style="{ backgroundColor: event?.color }"></div>
            <div class=" select-none text-on-surface text-title-lg">{{ event?.title }}</div>
        </div>
        <div class=" w-full flex gap-y-1 flex-col">
            <div class=" flex items-center gap-x-3">
                <BIcon icon="PhInfo" class=" w-5 shrink-0 h-5 fill-on-surface/50" />
                <div class=" text-title-md text-wrap whitespace-normal select-none text-on-surface">{{
                    t('calendar.form.descriptions') }}</div>
            </div>
            <div class=" rtl:pr-10 ltr:pl-10 w-full text-justify text-body-md select-none text-on-surface/50">{{
                event?.description }}</div>
        </div>
        <div class=" w-full hidden md:flex items-center gap-x-3" v-if="canJoinCall">
            <BIcon :icon="event.service?.provider[0]?.serviceType === 'video-call' ? 'PhVideoCamera' : 'PhPhoneCall'"
                class=" w-5 shrink-0 h-5  fill-on-surface/50" />
            <div class=" flex-1 flex-col gap-y-1">
                <BButton @click="initCall" :text="t('calendar.form.enterCall')" />
                <div class=" text-body-md select-none text-on-surface/50">{{ fullCallUrl }}</div>
            </div>
            <BIcon @click="copyCallUrl" :icon="isCopied ? 'PhCheckCircle' : 'PhCopy'"
                class=" w-5 h-5 fill-on-surface/50 cursor-pointer" />
        </div>
        <div class=" w-full" v-if="event?.eventType === 'task' && event.checkList">
            <CheckList v-model="checkList" :title="t('calendar.form.checkList')" />
        </div>
        <div class=" flex flex-col gap-y-2 w-full" v-if="event?.attachement && event.attachement.trim().length !== 0">
            <div class=" flex items-center gap-x-3">
                <BIcon icon="PhFile" class=" w-5 shrink-0 h-5 fill-on-surface/50" />
                <div class=" w-full text-justify text-body-md select-none text-on-surface/50">
                    {{ t('calendar.form.attachement') }}</div>
            </div>
            <div dir="rtl"
                class=" max-w-57.5 bg-surface border-outline-variant border p-1 rounded-xl flex justify-end items-center">
                <FileDisplay :url="event.attachement" />
            </div>
        </div>
        <div v-if="displayedContacts" class=" w-full flex flex-col gap-y-2 ">
            <div class=" flex items-center gap-x-3">
                <BIcon icon="PhUsersThree" class=" w-5 shrink-0 h-5 fill-on-surface/50" />
                <div class=" w-full text-justify text-body-md select-none text-on-surface/50">
                    {{ t('calendar.form.people') }}</div>
            </div>
            <div class=" w-full rtl:pr-10 ltr:pl-10 flex flex-col gap-y-2">
                <div v-for="item in displayedContacts" :key="item.user.id"
                    class=" flex items-center select-none gap-x-2">
                    <div class=" w-8 h-8">
                        <ContactAvatar :contact="item.user" />
                    </div>
                    <div class="flex-1 flex justify-between items-center">
                        <div class=" text-body-md text-on-surface/50">
                            {{ item.user.name }} {{ item.user.lastName }}
                        </div>
                        <div v-if="false" class="text-[10px] font-bold opacity-30 uppercase tracking-tighter">
                            {{ item.accessType }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class=" flex items-center gap-x-4">
            <BIcon icon="PhClock" class=" w-5 h-5 fill-on-surface/50" />
            <div v-if="event" class=" select-none text-title-md text-on-surface">
                {{ formatEventFullDateTime(event) }}
            </div>
        </div>
        <div v-if="event?.eventType !== 'service'" class=" flex md:hidden gap-x-3">
            <div v-for="button in mobileActions" :key="button.icon" class=" basis-1/2">
                <BButton @click="handleAction(button.key)" :text="button.text" :left-icon="button.icon"
                    :color="button.color" :type="button.type" class=" min-w-full" />
            </div>
        </div>
        <div v-else-if="canJoinCall" class="md:hidden w-full flex gap-x-2">
            <BButton @click="initCall" class=" min-w-full" :text="t('calendar.form.enterCall')" />
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, type PropType, ref, computed } from 'vue';
import type { CalendarEventPayload } from '~/types/calendar';
import { useI18n, useDate, useProfileStore, useAppToast, useCallStore } from '#imports';
import ContactAvatar from '~/components/chat/contact/ContactAvatar.vue';
import type { Contact } from '~/types/chat';
import CheckList from '../event-management/CheckList.vue';
import FileFormatDisplay from '~/components/general/FileFormatDisplay.vue';
import FileDisplay from '~/components/chat/chat-bubbles/FileDisplay.vue';
import { useEventBus } from '@vueuse/core';
import { useRouter } from 'vue-router';
export default defineComponent({
    name: 'CalendarItemDisplay',
    props: {
        event: {
            type: Object as PropType<CalendarEventPayload | null>,
            required: true,
        }
    },
    components: {
        ContactAvatar,
        CheckList,
        FileDisplay,
        FileFormatDisplay,
    },
    emits: ['edit', 'delete', 'close', 'share'],
    setup(props, { emit }) {
        const router = useRouter()
        const callStore = useCallStore()
        const { openToast } = useAppToast()
        const { formatEventFullDateTime } = useDate()
        const { t } = useI18n()
        const profileStore = useProfileStore()
        const checkList = ref(props.event?.checkList)
        const isService = computed(() => props.event?.eventType === 'service')
        const canJoinCall = computed(() => isService.value && props.event.service?.provider[0]?.isActive)
        const isCopied = ref(false)

        const bus = useEventBus<any>('calendar-actions');

        // 1. Determine the current user's access level
        const myAccess = computed(() => {
            if (!props.event) return 'viewer';

            // Check if I am in the accesss array
            const record = props.event.accesss?.find(a => a.user.id === profileStore.userData.id);
            return record ? record.accessType : 'viewer';
        });

        // 2. Permission Flags
        const canEditOrDelete = computed(() => {
            // Services are NEVER editable/deletable by the user
            if (isService.value) return false;

            // Owners and Editors can modify/delete
            return myAccess.value === 'owner' || myAccess.value === 'editor';
        });

        const displayedContacts = computed(() => {
            if (!props.event) return null;

            if (props.event.eventType === 'service' && props.event.service?.provider?.length) {
                return props.event.service.provider.map(p => ({ user: p, accessType: null }));
            }

            if (props.event.accesss && props.event.accesss.length > 0) {
                return props.event.accesss;
            }

            return null;
        });

        const actions = computed(() => {
            return [
                {
                    icon: 'PhX',
                    key: 'close',
                    active: true,
                },
                {
                    icon: 'PhShareNetwork',
                    key: 'share',
                    active: true, // Everyone can share
                },
                {
                    icon: 'PhPen',
                    key: 'edit',
                    active: canEditOrDelete.value,
                },
                {
                    icon: 'PhTrash',
                    key: 'delete',
                    active: canEditOrDelete.value,
                }
            ].filter(item => item.active);
        });

        const mobileActions = computed(() => [
            {
                icon: 'PhPencilSimple',
                key: 'edit',
                color: 'secondary',
                text: t('calendar.form.edit'),
                type: 'fill',
                active: !isService.value,
            },
            {
                icon: 'PhTrash',
                key: 'delete',
                color: 'error',
                text: t('calendar.form.delete.delete'),
                type: 'outline',
                active: !isService.value,
            },
        ])


        const handleAction = (key: string) => {
            switch (key) {
                case 'close':
                    emit('close')
                    break;
                case 'edit':
                    emit('edit')
                    break;
                case 'delete':
                    emit('delete')
                    break;
                case 'share':
                    emit('share')
                    break;
            }
        }


        const config = useRuntimeConfig()

        // Construct the provider ID and route
        const contact = computed(() => props.event?.service?.provider[0])
        const callPath = computed(() => `/dashboard/chat/${contact.value.id}/call`)

        // Construct the full URL for the copy-to-clipboard feature
        const fullCallUrl = computed(() => {
            if (!contact.value) return ''
            return `${config.public.siteUrl}${callPath.value}?initCall=true`
        })

        const copyCallUrl = async () => {
            try {
                await navigator.clipboard.writeText(fullCallUrl.value)
                openToast(t('calendar.share.copySuccess'), 'success')
                isCopied.value = true;
            } catch (err) {
                console.error('Failed to copy', err)
            }
        }


        const initCall = () => {
            if (contact.value && contact.value?.isActive) {
                callStore.startCall(contact.value, contact.value.serviceType)
                router.push(callPath.value)
            }
        }

        return {
            actions,
            initCall,
            handleAction,
            t,
            formatEventFullDateTime,
            displayedContacts,
            canJoinCall,
            checkList,
            mobileActions,
            copyCallUrl,
            callPath,
            isCopied,
            fullCallUrl,
        }
    }
})
</script>