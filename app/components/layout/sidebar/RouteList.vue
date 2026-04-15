<template>
    <div class=" w-full h-full  flex flex-col">
        <div class=" shrink-0 border-b border-b-surface-variant-2 w-full px-2.5 py-3">
            <RoleSwitcher />
        </div>
        <div class=" w-full"></div>
    </div>
</template>
<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { NavSubItem } from '~/types/components/nav-sub-item';
import { useProfileStore } from '#imports';
import { useRoute, useRouter } from 'vue-router';
import RoleSwitcher from './RoleSwitcher.vue';

export default defineComponent({
    name: 'RouteList',
    components: {
        RoleSwitcher,
    },
    props: {
        routes: {
            type: Array as PropType<NavSubItem[]>,
            required: true,
            default: () => []
        }
    },
    setup(props) {
        const profileStore = useProfileStore()
        const route = useRoute()
        const router = useRouter()

        return {

        }
    }
})
</script>