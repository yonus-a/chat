<template>
    <div class=" p-6 cursor-default flex flex-col gap-y-4.5 w-[90vw] max-w-140">
        <div class=" flex items-center gap-x-2">
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
                <div class=" text-title-md select-none text-on-surface">{{ t('calendar.form.descriptions') }}</div>
            </div>
            <div class=" w-full text-justify text-body-md select-none text-on-surface/50">{{ event?.description }}</div>
        </div>
        <div class=" flex items-center gap-x-4">
            <BIcon icon="PhClock" class=" w-5 h-5 fill-on-surface/50" />
            <div v-if="event" class=" select-none text-title-md text-on-surface">
                {{ formatEventFullDateTime(event) }}
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, type PropType, ref, computed } from 'vue';
import type { CalendarEventPayload } from '~/types/calendar';
import { useI18n, useDate } from '#imports';

export default defineComponent({
    name: 'CalendarItemDisplay',
    props: {
        event: {
            type: Object as PropType<CalendarEventPayload | null>,
            required: true,
        }
    },
    emits: ['edit', 'delete', 'close'],
    setup(props, { emit }) {
        const { formatEventFullDateTime } = useDate()
        const { t } = useI18n()

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
        }
    }
})
</script>