<template>
    <div ref="menuWrapper" class="relative">
        <div @click.stop="toggleMenu" class="cursor-pointer relative" :class="[overlay ? 'z-90' : '']">
            <slot name="trigger" :isOpen="isOpen" />
        </div>

        <div v-if="overlay" @click="closeMenu"
            class="w-dvw h-dvh fixed top-0 left-0 transition-all duration-300 ease-in-out z-80"
            :class="[isOpen ? 'bg-on-background/20 backdrop-blur-sm pointer-events-auto' : 'backdrop-blur-none bg-on-background/0 pointer-events-none']">
        </div>

        <div ref="panelRef" @click="handleContentClick"
            class="absolute z-120  bg-surface shadow-floating rounded-xl border border-outline-variant transition-all duration-200 ease-in-out"
            :style="panelPositionStyles"
            :class="[isOpen ? 'shadow-[0px_8px_24px_rgba(149,157,165,0.2)]' : 'shadow-none', !hasCustomContent && options && options.length > 0 ? 'w-50' : '']">

            <div v-if="hasCustomContent" key="menu-custom">
                <slot :close="closeMenu" />
            </div>

            <div v-else-if="options && options.length > 0" key="menu-list" class="flex p-3 flex-col gap-y-1">
                <template v-for="(opt, idx) in options" :key="opt.key">
                    <div class="pointer-events-auto">
                        <div @click="handleSelect(opt.key)"
                            class="bg-surface-variant-2/0 hover:bg-surface-variant-2 transition-all duration-200 ease-in-out h-11 flex items-center cursor-pointer rounded-lg px-2 gap-x-2 w-full">
                            <BIcon :icon="opt.icon" class="w-5 h-5"
                                :class="[opt.color ? `fill-${opt.color}` : 'fill-on-surface/50']" />
                            <div class="select-none text-label-sm"
                                :class="[opt.color ? `text-${opt.color}` : 'text-on-surface/50']">
                                {{ opt.label }}
                            </div>
                        </div>
                    </div>
                    <div v-if="idx < options.length - 1" class="px-2">
                        <div class="h-px w-full bg-outline-container" />
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, nextTick, watch, type PropType, useSlots, Comment, Fragment, Text } from 'vue';
import { useClickOutside } from '#imports';

const globalActiveMenuId = ref<string | null>(null);
export interface Option {
    key: string;
    label: string;
    icon: string;
    color?: string;
}

export default defineComponent({
    name: 'BMenu',
    props: {
        options: { type: Array as PropType<Option[]>, default: () => [] },
        overlay: { type: Boolean, default: false },
        autoClose: {
            type: Boolean, default: false,
        }
    },
    emits: ['select', 'open', 'close'],
    setup(props, { emit, expose }) {
        const isOpen = ref(false);
        const menuWrapper = ref<HTMLElement | null>(null);
        const panelRef = ref<HTMLElement | null>(null);

        const slots = useSlots(); // Add this

        const hasCustomContent = computed(() => {
            if (!slots.default) return false;

            const checkNodes = (nodes: any[]): boolean => {
                return nodes.some(node => {
                    if (node.type === Comment) return false;
                    if (node.type === Fragment && Array.isArray(node.children)) return checkNodes(node.children);
                    if (node.type === Text && typeof node.children === 'string' && !node.children.trim()) return false;
                    return true;
                });
            };

            return checkNodes(slots.default({ close: closeMenu }));
        });



        // New reactive alignment states
        const verticalAlign = ref<'bottom' | 'top'>('bottom');
        const horizontalAlign = ref<'left' | 'right'>('left');

        const instanceId = useId();

        const calculateAlignment = async () => {
            await nextTick();
            if (!menuWrapper.value || !panelRef.value) return;

            const triggerRect = menuWrapper.value.getBoundingClientRect();
            const panelWidth = panelRef.value.offsetWidth;
            const panelHeight = panelRef.value.offsetHeight;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // 1. VERTICAL CHECK: If opening below hits bottom, and there's room above, go TOP.
            if (triggerRect.bottom + panelHeight > viewportHeight && triggerRect.top > panelHeight) {
                verticalAlign.value = 'top';
            } else {
                verticalAlign.value = 'bottom';
            }

            // 2. HORIZONTAL CHECK: If opening to the right hits edge, go RIGHT (meaning align right edges).
            if (triggerRect.left + panelWidth > viewportWidth) {
                horizontalAlign.value = 'right';
            } else {
                horizontalAlign.value = 'left';
            }
        };

        const toggleMenu = () => {
            if (!isOpen.value) {
                globalActiveMenuId.value = instanceId;
                isOpen.value = true;
                calculateAlignment(); // Run the logic here
            } else {
                closeMenu();
            }
        };

        const panelPositionStyles = computed(() => {
            const isVisible = isOpen.value;
            const styles: any = {
                opacity: isVisible ? '1' : '0',
                pointerEvents: isVisible ? 'auto' : 'none',
                // REMOVE height: isVisible ? 'auto' : '0',
                visibility: isVisible ? 'visible' : 'hidden', // Added for better screen reader/layout handling
                whiteSpace: 'nowrap',
                position: 'absolute'
            };

            if (verticalAlign.value === 'bottom') {
                styles.top = '100%';
                styles.bottom = 'auto';
                styles.transform = isVisible ? 'translateY(12px)' : 'translateY(0px)';
            } else {
                styles.bottom = '100%';
                styles.top = 'auto';
                styles.transform = isVisible ? 'translateY(-12px)' : 'translateY(0px)';
            }

            // Dynamic Horizontal Positioning
            if (horizontalAlign.value === 'left') {
                styles.left = '0';
                styles.right = 'auto';
            } else {
                styles.right = '0';
                styles.left = 'auto';
            }

            return styles;
        });

        // Rest of your logic...
        const closeMenu = () => {
            isOpen.value = false;
            emit('close');
            if (globalActiveMenuId.value === instanceId) globalActiveMenuId.value = null;
        };

        watch(globalActiveMenuId, (newId) => { if (newId !== instanceId) isOpen.value = false; });
        useClickOutside(menuWrapper, closeMenu);
        const handleSelect = (key: string) => { emit('select', key); closeMenu(); };
        const getColorClass = (color?: string) => {
            switch (color) {
                case 'success': return 'text-success fill-success';
                case 'error': return 'text-error fill-error';
                case 'primary': return 'text-primary fill-primary';
                case 'warning': return 'text-warning fill-warning';
                default: return 'text-on-background fill-on-background';
            }
        };

        const handleContentClick = () => {
            if (!props.autoClose) return
            closeMenu()
        }

        expose({ open: () => { globalActiveMenuId.value = instanceId; isOpen.value = true; calculateAlignment(); }, close: closeMenu });

        return { isOpen, handleContentClick, menuWrapper, panelRef, toggleMenu, closeMenu, handleSelect, getColorClass, panelPositionStyles, hasCustomContent };
    }
});
</script>