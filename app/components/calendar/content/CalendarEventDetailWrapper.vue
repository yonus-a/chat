<template>
    <Teleport to="body">
        <div class="fixed pointer-events-none z-100" :style="{ top: `${y}px`, left: `${x}px` }">
            <BMenu @close="onClose" @open="onOpen" ref="menuRef">
                <template #trigger>
                    <div class="w-1 h-1"></div>
                </template>
                <CalendarItemContent v-if="activeEvent" @delete="handleDelete" @close="closeAll" :event="activeEvent" />
            </BMenu>
        </div>

        <BPopup has-close :title="t('calendar.form.type.event')" ref="popupRef" @close="onClose" @open="onOpen">
            <div class="w-full flex justify-center">
                <CalendarItemContent v-if="activeEvent" @delete="handleDelete" @close="closeAll" :event="activeEvent" />
            </div>
        </BPopup>
    </Teleport>
</template>

<script lang="ts">
import { defineComponent, ref, useTemplateRef } from 'vue';
import { useEventBus, useWindowSize } from '@vueuse/core';
import { useI18n } from '#imports';
import type { CalendarEventPayload } from '~/types/calendar';
import type { Menu } from '~/types/components/menu';
import type { Popup } from '~/types/components/popup';
import CalendarItemContent from './CalendarItemContent.vue';

export default defineComponent({
    name: 'CalendarEventDetailWrapper',
    components: { CalendarItemContent },
    emits: ['lock-scroll'],
    setup(_, { emit }) {
        const { t } = useI18n();
        const { width } = useWindowSize();
        const activeEvent = ref<CalendarEventPayload | null>(null);

        const x = ref(0);
        const y = ref(0);

        const menuRef = useTemplateRef<Menu>('menuRef');
        const popupRef = useTemplateRef<Popup>('popupRef');

        const bus = useEventBus<any>('calendar-actions');

        bus.on((payload) => {
            if (payload.type === 'open-details') {
                activeEvent.value = payload.event;
                x.value = payload.x;
                y.value = payload.y;

                setTimeout(() => {
                    if (width.value > 1024) {
                        menuRef.value?.open();
                    } else {
                        popupRef.value?.open();
                    }
                    onOpen();
                }, 10);
            }
        });

        const onOpen = () => { emit('lock-scroll', true); console.log('fuck open') };
        const onClose = () => { emit('lock-scroll', false); console.log('fuck close') };

        const closeAll = () => {
            menuRef.value?.close();
            popupRef.value?.close();
        };

        const handleDelete = () => {
            if (activeEvent.value) {
                bus.emit({ type: 'delete', id: activeEvent.value.id });
            }
            closeAll();
        };

        return { t, x, y, activeEvent, menuRef, popupRef, onOpen, onClose, closeAll, handleDelete };
    }
});
</script>