<template>
    <div :style="wrapperStyle" :class="[position !== 'static' ? 'absolute px-1 lg:px-4' : '']">
        <div :class="[
            'flex relative items-center min-h-4 rounded-lg md:rounded-md cursor-pointer transition-transform text-[11px] leading-[1.2]',
            mode === 'monthly' ? 'px-2 mb-1 h-6 w-full shrink-0 whitespace-nowrap text-ellipsis' : 'px-4 w-full h-full',
            (mode === 'daily' || mode === 'weekly') ? 'shadow-sm border border-white/20' : ''
        ]" :style="contentStyle" @click="$emit('click', event)">

            <BMenu @close="toggleMenuState(false)" @open="toggleMenuState(true)" ref="menuRef">
                <template #trigger>
                    <div class="w-full relative z-50 flex items-center gap-x-1">
                        <div v-if="displayedContact" class="w-5 h-5 shrink-0">
                            <ContactAvatar :contact="displayedContact[0]" :show-online="false" class="w-full h-full" />
                        </div>
                        <div
                            class="text-label-md line-clamp-1 overflow-hidden text-ellipsis select-none text-on-primary">
                            {{ event.title }}
                        </div>
                    </div>
                </template>
                <CalendarItemContent :event="event" />
            </BMenu>

        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, type PropType, useTemplateRef } from 'vue';
import type { CalendarMode, CalendarTimeRange, CalendarDay } from '~/types/components/calendar';
import type { CalendarEventPayload } from '~/types/calendar';
import { useWindowSize, useProfileStore } from '#imports';
import type { Contact } from '~/types/chat';
import ContactAvatar from '~/components/chat/contact/ContactAvatar.vue';
import type { Menu } from '~/types/components/menu';
import CalendarItemContent from './item/CalendarItemContent.vue';
export default defineComponent({
    name: 'CalendarEventItem',
    props: {
        event: { type: Object as PropType<CalendarEventPayload>, required: true },
        mode: { type: String as PropType<CalendarMode>, default: 'daily' },
        headers: { type: Array as PropType<CalendarDay[]>, default: () => [] },
        hours: { type: Object as PropType<CalendarTimeRange>, default: () => ({ start: 0, end: 24 }) },
        position: {
            type: String as PropType<'auto' | 'static'>,
            default: 'auto'
        }
    },
    components: {
        ContactAvatar,
        CalendarItemContent,
    },
    setup(props) {
        const { width } = useWindowSize()
        const isMobile = computed(() => width.value < 768)
        const menuRef = useTemplateRef<Menu>('menuRef')
        const menuOpen = ref(false)

        const profileStore = useProfileStore();

        const displayedContact = computed<Contact | null>(() => {
            if (!props.event.selectedUsers || props.event.selectedUsers.length === 0) return null
            // Priority 1: Event type is service -> use first provider
            if (props.event.eventType === 'service' && props.event.service?.provider?.length) {
                return props.event.service.provider || null; // <--- ADDED
            }

            if (props.event.eventType !== 'service' && props.event.selectedUsers?.length) {
                const members = profileStore.getFamilyMembersByIds([props.event.selectedUsers[0]]);
                return members && members.length > 0 ? members : null; // <--- ADDED
            }

            return null;
        });

        onMounted(() => {
            nextTick(() => {
                console.log(displayedContact.value)
            })
        })

        const wrapperStyle = computed(() => {
            // Force the z-index directly into the DOM inline styles. 100 if open, 10 if closed.
            const currentZIndex = menuOpen.value ? 100 : 10;

            if (props.mode === 'monthly') {
                return { zIndex: currentZIndex, position: 'relative' };
            }
            if (props.position === 'static') {
                return {
                    width: `100%`,
                    height: `36px`,
                    zIndex: currentZIndex,
                    position: 'relative'
                };
            }

            const dayIndex = props.headers.findIndex(h =>
                new Date(h.date).toDateString() === new Date(props.event.date).toDateString()
            );

            if (dayIndex === -1) return { display: 'none' };

            const totalHours = props.hours.end - props.hours.start;
            const [h, m] = props.event.time.split(':').map(Number);
            const eventStartDecimal = h + (m / 60);

            const topPercent = ((eventStartDecimal - props.hours.start) / totalHours) * 100;
            const columnWidth = 100 / props.headers.length;

            return {
                top: `${topPercent}%`,
                left: `${dayIndex * columnWidth}%`,
                width: `${columnWidth}%`,
                height: isMobile.value && props.mode === 'weekly' ? '16px' : '36px',
                zIndex: currentZIndex // <--- BULLETPROOF FIX
            };
        });
        const contentStyle = computed(() => {
            if (props.mode === 'monthly') {
                return {
                    backgroundColor: props.event.color + '20',
                    borderLeft: `3px solid ${props.event.color}`,
                    color: props.event.color
                };
            }
            return {
                backgroundColor: props.event.color,
                color: '#fff'
            };
        });


        const toggleMenuState = (state: boolean) => {
            menuOpen.value = state
        }

        const openMenu = () => {
            if (menuOpen.value) return
            menuRef.value?.open()
        }

        return { wrapperStyle, contentStyle, displayedContact, menuRef, toggleMenuState, openMenu, menuOpen };
    }
});
</script>