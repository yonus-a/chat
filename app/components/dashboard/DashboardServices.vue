<template>
    <div class=" w-full md:h-85 gap-y-4 flex flex-col p-4 bg-surface border border-outline-variant  rounded-3xl">
        <div class=" w-full flex justify-between items-center">
            <div v-loading="isLoading" class=" select-none text-on-surface shrink-0 text-title-sm">{{ cardTitle }}</div>
            <CardLink v-loading="isLoading" to="/dashboard/services" class=" shrink-0"
                :title="t('dashboard.services.viewAll', { count: allServicesCounts })" />
        </div>
        <div class=" w-full flex-1">
            <div class=" w-full h-full flex items-center justify-center"
                v-if="finalDisplayedData.length === 0 && !isLoading">
                No Data
            </div>
            <div v-else class=" w-full flex flex-col h-full gap-y-2">
                <ServiceDisplay :type="type" v-for="service in finalDisplayedData" :key="service.key" :service="service"
                    :loading="isLoading" />
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { type PropType, defineComponent, computed, ref } from 'vue';
import { useI18n, useLocalePath } from '#imports';
import CardLink from './CardLink.vue';
import ServiceDisplay from './list-items/ServiceDisplay.vue';
export default defineComponent({
    name: 'DashboardServices',
    props: {
        type: {
            type: String as PropType<'consulting' | 'special' | 'history'>,
            required: true,
        }
    },
    components: {
        CardLink,
        ServiceDisplay,
    },
    setup(props) {
        const { t } = useI18n()
        const allServicesCounts = ref(6)
        const itemsDisplayed = computed(() => props.type === 'history' ? 3 : 4)
        const isLoading = ref(false)

        const mockService = ref({
            title: 'The Service Title',
            key: 'test',
            icon: 'PhHeart'
        })

        const cardTitle = computed(() => {
            let title = ''
            switch (props.type) {
                case 'history':
                    title = t('dashboard.services.history')
                    break;
                case 'consulting':
                    title = t('dashboard.services.consult')
                    break;
                case 'special':
                    title = t('dashboard.services.special')
                    break;
            }
            return title
        })

        const realServices = ref([
            { title: 'Service 1', key: '1', icon: 'PhUser', date: Date() },
            { title: 'Service 2', key: '2', icon: 'PhActivity', date: Date() },
            { title: 'Service 3', key: '3', icon: 'PhCalendar', date: Date() },
            { title: 'Service 4', key: '4', icon: 'PhClipboard', date: Date() },
            { title: 'Service 5', key: '5', icon: 'PhFlask', date: Date() },
        ])

        // 2. Implement the computed logic
        const finalDisplayedData = computed(() => {
            if (isLoading.value) {
                // Return an array of mocks with length matching itemsDisplayed
                return Array.from({ length: itemsDisplayed.value }, () => ({ ...mockService.value }));
            }

            // Return real data sliced to the limit
            return realServices.value.slice(0, itemsDisplayed.value);
        });




        return {
            cardTitle,
            allServicesCounts,
            t,
            finalDisplayedData,
            isLoading,
        }
    }
})
</script>