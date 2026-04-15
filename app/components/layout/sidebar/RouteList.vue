<template>
    <div class="w-full h-full flex flex-col">
        <div class="shrink-0 border-b border-surface-variant-2 w-full px-2.5 py-3">
            <RoleSwitcher />
        </div>

        <div class="flex-1 overflow-y-auto hide-scrollbar py-4 px-2.5 flex flex-col gap-y-1.5">
            <RouteItem v-for="(item, index) in routes" :key="item.label + index" :item="item" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { NavSubItem } from '~/types/components/nav-sub-item';
import RoleSwitcher from './RoleSwitcher.vue';
import RouteItem from './RouteItem.vue';

export default defineComponent({
    name: 'RouteList',
    components: {
        RoleSwitcher,
        RouteItem
    },
    props: {
        routes: {
            type: Array as PropType<NavSubItem[]>,
            required: true,
            default: () => []
        }
    },
    setup(props) {
        onMounted(() => {
            console.log(props.routes)
        })

        watch(() => props.routes, () => {
            console.log(props.routes)
        }, { deep: true, immediate: true })

        return {

        }
    }
});
</script>