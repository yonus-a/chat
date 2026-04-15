<template>
    <div class="w-full flex flex-col">
        <div @click="handleClick"
            class="group w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer select-none"
            :class="[
                isActive ? 'bg-primary/20 text-primary' : 'hover:bg-on-surface/5 text-on-surface/70',
                item.disabled ? 'opacity-50 cursor-not-allowed' : ''
            ]" :style="{ paddingInlineStart: `${depth * 12 + 12}px` }">
            <div class="flex items-center gap-x-2 overflow-hidden">
                <BIcon v-if="item.icon" :icon="item.icon" class="w-5 h-5 shrink-0 transition-colors"
                    :weight="isActive ? 'fill' : 'regular'"
                    :class="isActive ? 'fill-primary' : 'fill-on-surface/50 group-hover:fill-on-surface'" />
                <div v-else class="w-1.5 h-1.5 rounded-full shrink-0 bg-current opacity-40"></div>

                <span class=" text-body-sm transition-all duration-200 ease-in-out truncate"
                    :class="[isActive ? ' text-primary' : ' text-on-surface/70']">{{ item.label }}</span>
            </div>

            <BIcon v-if="hasChildren" icon="PhCaretDown" class="w-4 h-4 transition-transform duration-300 fill-current"
                :class="{ 'rotate-180': isExpanded }" />
        </div>

        <div v-if="hasChildren" class="overflow-hidden transition-all duration-300 ease-in-out"
            :class="isExpanded ? 'max-h-125 opacity-100 mt-1' : 'max-h-0 opacity-0'">
            <RouteItem v-for="(child, index) in item.children" :key="child.label + index" :item="child"
                :depth="depth + 1" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, type PropType } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import type { NavSubItem } from '~/types/components/nav-sub-item';

export default defineComponent({
    name: 'RouteItem',
    props: {
        item: {
            type: Object as PropType<NavSubItem>,
            required: true
        },
        depth: {
            type: Number,
            default: 0
        }
    },
    setup(props) {
        const router = useRouter();
        const route = useRoute();
        const isExpanded = ref(false);

        const hasChildren = computed(() => props.item.children && props.item.children.length > 0);

        // Logic to determine if this specific link or any of its children are active
        const isActive = computed(() => {
            if (props.item.to && props.item.to !== '#' && route.path === props.item.to) {
                return true;
            }
            if (hasChildren.value) {
                return props.item.children?.some(child => route.path === child.to);
            }
            return false;
        });

        const handleClick = () => {
            if (props.item.disabled) return;

            if (hasChildren.value) {
                isExpanded.value = !isExpanded.value;
            } else if (props.item.to && props.item.to !== '#') {
                router.push(props.item.to);
            }
        };

        // Auto-expand if a child is active on mount
        if (hasChildren.value && isActive.value) {
            isExpanded.value = true;
        }

        return {
            isExpanded,
            isActive,
            hasChildren,
            handleClick
        };
    }
});
</script>