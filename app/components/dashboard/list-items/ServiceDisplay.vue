<template>
    <div v-loading="isLoading" @click="goToService"
        class=" w-full p-3 rounded-xl transition-all duration-200 ease-in-out bg-surface-variant border border-surface-variant flex items-center gap-x-3 hover:bg-primary/10 group hover:border-primary cursor-pointer">
        <BIcon class="w-6 h-6 group-hover:fill-primary transition-all duration-200 ease-in-out fill-on-surface-variant"
            :icon="service.icon" />
        <div
            class=" select-none text-label-sm text-on-surface-variant transition-all duration-200 ease-in-out group-hover:text-primary">
            {{ service.title }}
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { useLocalePath } from '#imports';
import { useRouter } from 'vue-router';
export interface DashboardService {
    title: string;
    key: string;
    icon: string
}
export default defineComponent({
    name: 'Service',
    props: {
        loading: {
            type: Boolean,
            default: false,
        },
        service: {
            type: Object as PropType<DashboardService>,
            required: true,
        }
    },
    setup(props) {
        const router = useRouter()
        const localePath = useLocalePath()
        const isLoading = computed(() => props.loading)
        const goToService = () => {
            if (!props.loading) {
                router.push(localePath(`/dashboard/service/${props.service.key}`))
            }
        }

        return {
            goToService,
            isLoading,
        }
    }
})
</script>