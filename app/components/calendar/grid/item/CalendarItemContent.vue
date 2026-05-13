<template>
    <div class=" p-1 text-wrap whitespace-normal md:p-6 cursor-default flex flex-col gap-y-3.5 w-dvw md:max-w-140">
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
        <div class=" w-full" v-if="event?.eventType === 'task'">
            <CheckList v-model="checkList" />
        </div>
        <div class=" flex flex-col gap-y-2 w-full" v-if="event?.attachement && event.attachement.trim().length !== 0">
            <div class=" flex items-center gap-x-3">
                <BIcon icon="PhFile" class=" w-5 shrink-0 h-5 fill-on-surface/50" />
                <div class=" w-full text-justify text-body-md select-none text-on-surface/50">
                    {{ t('calendar.form.attachement') }}</div>
            </div>
            <div class=" w-full flex flex-col gap-y-2">
                <CalendarAttachementDisplay :url="event.attachement" />
            </div>
        </div>
        <div v-if="displayedContacts" class=" w-full flex flex-col gap-y-2 ">
            <div class=" flex items-center gap-x-3">
                <BIcon icon="PhUsersThree" class=" w-5 shrink-0 h-5 fill-on-surface/50" />
                <div class=" w-full text-justify text-body-md select-none text-on-surface/50">
                    {{ t('calendar.form.people') }}</div>
            </div>
            <div class=" w-full rtl:pr-10 ltr:pl-10 flex flex-col gap-y-2">
                <div v-for="user in displayedContacts" class=" flex items-center select-none gap-x-2">
                    <div class=" w-8 h-8">
                        <ContactAvatar :contact="user" />
                    </div>
                    <div class=" text-body-md text-on-surface/50">{{ user.name }} {{ user.lastName }}</div>
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
    </div>
</template>
<script lang="ts">
import { defineComponent, type PropType, ref, computed } from 'vue';
import type { CalendarEventPayload } from '~/types/calendar';
import { useI18n, useDate, useProfileStore } from '#imports';
import ContactAvatar from '~/components/chat/contact/ContactAvatar.vue';
import type { Contact } from '~/types/chat';
import CheckList from '../../event-management/CheckList.vue';
import CalendarAttachementDisplay from '../../content/CalendarAttachementDisplay.vue';
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
        CalendarAttachementDisplay,
    },
    emits: ['edit', 'delete', 'close'],
    setup(props, { emit }) {
        const { formatEventFullDateTime } = useDate()
        const { t } = useI18n()
        const profileStore = useProfileStore()
        const checkList = ref(props.event?.checkList)

        const displayedContacts = computed<Contact | null>(() => {
            if (!props.event) return null
            if (!props.event.selectedUsers || props.event.selectedUsers.length === 0) return null
            // Priority 1: Event type is service -> use first provider
            if (props.event.eventType === 'service' && props.event.service?.provider?.length) {
                return props.event.service.provider || null;
            }

            if (props.event.eventType !== 'service' && props.event.selectedUsers?.length) {
                const members = profileStore.getFamilyMembersByIds(props.event.selectedUsers);
                return members && members.length > 0 ? members : null;
            }

            return null;
        });

        const actions = computed(() => {
            let items = [
                {
                    icon: 'PhX',
                    key: 'close',
                    active: true,
                },
                {
                    icon: 'PhPen',
                    key: 'edit',
                    active: props.event?.eventType !== 'service',
                },
                {
                    icon: 'PhTrash',
                    key: 'delete',
                    active: props.event?.eventType !== 'service',
                }
            ]
            return items.filter((item) => item.active === true)
        })

        const mobileActions = computed(() => [
            {
                icon: 'PhPencilSimple',
                key: 'edit',
                color: 'secondary',
                text: t('calendar.form.edit'),
                type: 'fill',
            },
            {
                icon: 'PhTrash',
                key: 'delete',
                color: 'error',
                text: t('calendar.form.delete.delete'),
                type: 'outline',
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
            }
        }


        return {
            actions,
            handleAction,
            t,
            formatEventFullDateTime,
            displayedContacts,
            checkList,
            mobileActions,
        }
    }
})
</script>