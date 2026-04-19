<template>
    <div v-loading="isLoading" @click="goToService"
        class="  p-3 rounded-xl transition-all duration-200 ease-in-out bg-surface-variant border border-surface-variant  hover:bg-primary/10 group hover:border-primary cursor-pointer">
        <div class="flex items-center gap-x-3 w-full">
            <BIcon
                class="w-6 h-6 group-hover:fill-primary transition-all duration-200 ease-in-out fill-on-surface-variant"
                :icon="service.icon" />
            <div
                class=" select-none text-label-sm text-on-surface-variant transition-all duration-200 ease-in-out group-hover:text-primary">
                {{ service.title }}
            </div>
        </div>
        <div class=" mt-2 w-full flex items-center justify-between" v-if="type == 'history'">
            <div class=" select-none text-primary text-body-sm">{{ t('dashboard.services.result') }}</div>
            <div v-if="service.date" class=" text-on-surface/50 text-body-sm">{{ formatDateTime(service.date) }}</div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import { useLocalePath } from '#imports';
import { useRouter } from 'vue-router';
import { useI18n } from '#imports';
import { useDate } from '#imports';
export interface DashboardService {
    title: string;
    key: string;
    icon: string;
    date?: Date;
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
        },
        type: {
            type: String as PropType<'consulting' | 'special' | 'history'>,
            required: true,
        }
    },
    setup(props) {
        const { formatDateTime } = useDate()
        const { t } = useI18n()
        const router = useRouter()
        const localePath = useLocalePath()
        const isLoading = computed(() => props.loading)
        const goToService = () => {
            if (!props.loading) {
                router.push(localePath(`/dashboard/service/${props.service.key}`))
            }
        }

        return {
            t,
            goToService,
            isLoading,
            formatDateTime,
        }
    }
})
</script>