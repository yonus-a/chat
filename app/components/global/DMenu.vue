<template>
    <div ref="menuWrapper" class="relative">
        <div @click.stop="toggleMenu" class="cursor-pointer relative " :class="[overlay ? 'z-90' : '']">
            <slot name="trigger" :isOpen="isOpen" />
        </div>

        <div v-if="overlay" @click="closeMenu"
            class=" w-dvw h-dvh fixed top-0 left-0  transition-all duration-300 ease-in-out z-80"
            :class="[isOpen ? ' bg-on-background/20 backdrop-blur-sm pointer-events-auto' : ' backdrop-blur-none bg-on-background/0 pointer-events-none']">
        </div>
        <div ref="panelRef"
            class="absolute z-100 min-w-40 rounded-xl border border-outline-container bg-background transition-all duration-200 ease-in-out overflow-hidden"
            :style="panelPositionStyles"
            :class="[isOpen ? 'shadow-[0px_8px_24px_rgba(149,157,165,0.2)] ' : 'shadow-none']">
            <div v-if="options.length > 0" class="flex flex-col">
                <template v-for="(opt, idx) in options" :key="opt.key">
                    <div @click="handleSelect(opt.key)"
                        class="flex items-center gap-x-2 p-2.5 hover:bg-surface-container transition-colors cursor-pointer group">
                        <DIcon v-if="opt.icon" :icon="opt.icon" :class="[getColorClass(opt.color), 'w-5 h-5']" />
                        <span :class="[getColorClass(opt.color), 'text-xs font-medium select-none']">{{ opt.title
                        }}</span>
                    </div>
                    <div v-if="idx < options.length - 1" class="px-2">
                        <div class="h-px w-full bg-outline-container" />
                    </div>
                </template>
            </div>

            <slot v-else :close="closeMenu" />
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed, nextTick, watch, type PropType } from 'vue';
import { useClickOutside } from '#imports';

// --- SINGLETON STATE ---
// This lives outside the component definition so all DMenu instances share it.
const globalActiveMenuId = ref<string | null>(null);

interface MenuOption {
    title: string;
    key: string;
    color?: 'success' | 'error' | 'primary' | 'warning' | 'neutral';
    icon?: string;
}

export default defineComponent({
    name: 'DMenu',
    props: {
        options: {
            type: Array as PropType<MenuOption[]>,
            default: () => []
        },
        overlay: {
            type: Boolean,
            default: false,
        }
    },
    emits: ['select', 'open', 'close'],
    setup(props, { emit, expose }) {
        const isOpen = ref(false);
        const menuWrapper = ref<HTMLElement | null>(null);
        const panelRef = ref<HTMLElement | null>(null);
        const horizontalAlign = ref<'left' | 'right'>('left');

        // Unique ID for this specific instance
        const instanceId = useId();

        const closeMenu = () => {
            isOpen.value = false;
            emit('close')
            if (globalActiveMenuId.value === instanceId) {
                globalActiveMenuId.value = null;
            }
        };

        const toggleMenu = () => {
            if (!isOpen.value) {
                // Opening this menu: Tell the global tracker it's our turn
                globalActiveMenuId.value = instanceId;
                isOpen.value = true;
                calculateAlignment();
            } else {
                closeMenu();
            }
        };

        // Watch the global tracker. If it changes to another ID, close this menu.
        watch(globalActiveMenuId, (newId) => {
            if (newId !== instanceId) {
                isOpen.value = false;
            }
        });

        const calculateAlignment = async () => {
            await nextTick();
            if (!menuWrapper.value || !panelRef.value) return;

            const triggerRect = menuWrapper.value.getBoundingClientRect();
            const panelWidth = panelRef.value.offsetWidth;
            const screenWidth = window.innerWidth;
            const isRtl = document.documentElement.dir === 'rtl';

            let align: 'left' | 'right' = isRtl ? 'left' : 'right';

            if (align === 'left') {
                if (triggerRect.left + panelWidth > screenWidth) {
                    align = 'right';
                }
            } else {
                if (triggerRect.right - panelWidth < 0) {
                    align = 'left';
                }
            }

            horizontalAlign.value = align;
        };

        const panelPositionStyles = computed(() => {
            const isVisible = isOpen.value;
            return {
                opacity: isVisible ? '1' : '0',
                transform: isVisible ? 'translateY(4px)' : 'translateY(0)',
                pointerEvents: isVisible ? 'auto' : 'none' as any,
                height: isVisible ? 'auto' : '0',
                [horizontalAlign.value]: '0',
                whiteSpace: 'nowrap'
            };
        });

        useClickOutside(menuWrapper, closeMenu);

        const handleSelect = (key: string) => {
            emit('select', key);
            closeMenu();
        };

        const getColorClass = (color?: string) => {
            switch (color) {
                case 'success': return 'text-success fill-success';
                case 'error': return 'text-error fill-error';
                case 'primary': return 'text-primary fill-primary';
                case 'warning': return 'text-warning fill-warning';
                default: return 'text-on-background fill-on-background';
            }
        };

        const openMenu = () => {
            globalActiveMenuId.value = instanceId;
            isOpen.value = true;
        }

        watch(() => isOpen.value, () => {
            if (isOpen.value) {
                emit('open')
            }
        })


        // Standard way to expose methods in setup()
        expose({
            open: openMenu,
            close: closeMenu
        });


        return {
            isOpen,
            menuWrapper,
            panelRef,
            horizontalAlign,
            toggleMenu,
            closeMenu,
            handleSelect,
            getColorClass,
            panelPositionStyles,
        };
    }
});
</script>