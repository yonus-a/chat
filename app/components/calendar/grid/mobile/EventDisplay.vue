<template>
    <div @click="handleOpen"
        class=" w-full overflow-hidden cursor-pointer flex flex-col select-none h-24 rounded-xl border border-outline-variant bg-surface relative">
        <div class=" p-4 w-full flex-1 flex flex-col gap-y-1.5">
            <div class=" text-label-md  text-on-surface">{{ event.title }}</div>
            <div class=" flex justify-between items-center">
                <div class=" text-on-surface/50 flex items-center gap-x-1">
                    <BIcon icon="PhClock" class=" w-4 h-4" />
                    <div class="text-body-sm">{{ timeRange }}</div>
                </div>
                <div>
                    <div dir="ltr" class=" flex justify-center items-center">
                        <div v-for="(contact, index) in selectedFamilyMembers" :key="contact.id"
                            class=" border border-surface w-6 h-6">
                            <ContactAvatar :class="[index > 0 ? ' -translate-x-1/2' : ' translate-x-0']"
                                :contact="contact" :show-online="false" />
                        </div>
                        <div v-if="remainingUsers > 0"
                            class=" bg-outline-variant border border-surface -translate-x-full w-6 h-6 rounded-full flex items-center justify-center select-none">
                            <div class=" select-none text-on-surface text-[10px]">
                                +{{ remainingUsers }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class=" w-full h-1 shrink-0" :style="{ backgroundColor: event.color }"></div>
    </div>
</template>
<script lang="ts">
import { defineComponent, type PropType, computed } from 'vue';
import type { CalendarEventPayload } from '~/types/calendar';
import { useProfileStore, useI18n } from '#imports';
import { useEventBus } from '@vueuse/core';
import ContactAvatar from '~/components/chat/contact/ContactAvatar.vue';
export default defineComponent({
    name: 'EventDisplay',
    props: {
        event: {
            type: Object as PropType<CalendarEventPayload>,
            required: true,
        },
        loading: {
            type: Boolean,
            default: false
        }
    },
    components: {
        ContactAvatar,
    },
    setup(props) {
        const profileStore = useProfileStore()
        const isLoading = computed(() => props.loading)

        const { locale } = useI18n();

        const timeRange = computed(() =>
            formatEventTimeRange(
                props.event.time,
                props.event.duration,
                props.event.endDate,
                locale.value
            )
        );

        const bus = useEventBus<any>('calendar-actions');

        const handleOpen = (e: MouseEvent) => {
            bus.emit({ type: 'open-details', event: props.event, x: e.clientX, y: e.clientY });
        }



        const selectedFamilyMembers = computed(() => {
            return props.event.accesss?.map(access => access.user).slice(0, 4) || [];
        });

        const remainingUsers = computed(() => {
            const total = props.event.accesss?.length || 0;
            return Math.max(0, total - selectedFamilyMembers.value.length);
        });



        return {
            isLoading,
            timeRange,
            selectedFamilyMembers,
            remainingUsers,
            handleOpen,
        }
    }
})
</script>