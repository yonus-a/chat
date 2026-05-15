<template>
    <div :style="wrapperStyle" :class="[position !== 'static' ? 'absolute px-1 lg:px-4' : '']">
        <div :class="[
            'flex relative items-center min-h-4 rounded-lg md:rounded-md cursor-pointer transition-transform text-[11px] leading-[1.2]',
            mode === 'monthly' ? 'px-2 mb-1 h-6 w-full shrink-0 whitespace-nowrap text-ellipsis' : 'px-4 w-full h-full',
            (mode === 'daily' || mode === 'weekly') ? '' : ''
        ]" :style="contentStyle" @click="handleOpen">

            <div class="w-full relative z-50 hidden md:flex items-center gap-x-1"
                :class="[event.color === 'white' ? ' text-black' : ' text-white']">
                <div v-if="displayedContact && !event.repetition && event.eventType !== 'medicine'"
                    class="w-5 h-5 shrink-0">
                    <ContactAvatar :contact="displayedContact" :show-online="false" class="w-full h-full" />
                </div>
                <BIcon v-else-if="event.repetition && event.eventType !== 'medicine'" icon="PhPill"
                    class=" w-5 h-5" />
                <BIcon v-else-if="event.eventType === 'medicine'" icon="PhArrowsClockwise" class=" w-5 h-5" />
                <div class="text-label-md line-clamp-1 overflow-hidden text-ellipsis select-none ">
                    {{ event.title }}
                </div>
            </div>

        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, type PropType, useTemplateRef } from 'vue';
import type { CalendarMode, CalendarTimeRange, CalendarDay } from '~/types/components/calendar';
import type { CalendarEventPayload } from '~/types/calendar';
import { useWindowSize, useProfileStore, useI18n, useCalendarStore } from '#imports';
import type { Contact } from '~/types/chat';
import { useEventBus } from '@vueuse/core';
import ContactAvatar from '~/components/chat/contact/ContactAvatar.vue';
import type { Menu } from '~/types/components/menu';
import type { Popup } from '~/types/components/popup';
import CalendarItemContent from '../content/CalendarItemContent.vue';
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
        const { t } = useI18n()
        const { width } = useWindowSize()
        const calendarStore = useCalendarStore()

        const isMobile = computed(() => width.value < 768)
        const menuRef = useTemplateRef<Menu>('menuRef')
        const popup = useTemplateRef<Popup>('popup')
        const menuOpen = ref(false)
        const bus = useEventBus<{ type: string; id: number | undefined }>('calendar-actions');

        const profileStore = useProfileStore();

        const displayedContact = computed<Contact | null>(() => {
            if (props.event.eventType === 'service' && props.event.service?.provider?.length) {
                return props.event.service.provider;
            }

            if (props.event.eventType !== 'service' && props.event.accesss?.length) {
                return props.event.accesss[0]?.user;
            }

            return null;
        });



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
                    position: 'relative'
                };
            }

            const dayIndex = props.headers.findIndex(h => {
                const hDate = new Date(h.date);
                const eDate = new Date(props.event.date);
                return hDate.getFullYear() === eDate.getFullYear() &&
                    hDate.getMonth() === eDate.getMonth() &&
                    hDate.getDate() === eDate.getDate();
            });

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


        const resolvedColor = computed(() => {
            const colorObj = calendarStore.colors.find(c => c.value === props.event.color);
            return colorObj ? colorObj.color : 'var(--color-surface-variant)';
        });

        const contentStyle = computed(() => {
            const cssBackground = resolvedColor.value;

            if (props.mode === 'monthly') {
                return {
                    background: cssBackground,
                    opacity: 0.7,
                    borderLeft: `4px solid ${cssBackground}`,
                    color: 'var(--color-on-surface)',
                    overflow: 'hidden'
                };
            }

            return {
                background: cssBackground,
                color: '#fff'
            };
        });

        const handleOpen = (e: MouseEvent) => {
            console.log(props.event.repetition)
            bus.emit({ type: 'open-details', event: props.event, x: e.clientX, y: e.clientY });
        }

        const toggleMenuState = (state: boolean) => {
            menuOpen.value = state
        }




        return { t, wrapperStyle, contentStyle, displayedContact, menuRef, toggleMenuState, handleOpen, menuOpen, popup, };
    }
});
</script>