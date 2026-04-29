<template>
    <div class="  max-w-dvw w-90 p-5 flex items-center justify-center ">
        <div class=" w-full max-w-90">
            <div class=" flex items-center gap-x-3">
                <BIcon icon="PhX" class=" w-5 h-5 cursor-pointer fill-on-surface/50 " @click="close" />
                <div class=" text-on-surface text-label-sm select-none">{{ t('chat.addMedic.title') }}</div>
            </div>
            <BSelect v-model="field" :title="t('chat.addMedic.expertise')" :placeholder="t('chat.addMedic.select')"
                :loading="isLoadingServices" :options="serviceOptions" class=" max-w-full min-w-full w-full pt-4" />
            <BCheckBox :disabled="isLoadingServices" v-model="autoSelect" :label="t('chat.addMedic.autoSelect')"
                mode="switch" />
            <div class=" w-full transition-all duration-200 ease-in-out whitespace-nowrap overflow-hidden"
                :class="[autoSelect ? 'h-0 pt-0 opacity-0 pointer-events-none' : 'h-auto pt-4 opacity-100 pointer-events-auto']">
                <BInput class=" max-w-full min-w-full w-full" icon="PhMagnifyingGlass" v-model="searchText"
                    :placeholder="t('chat.addMedic.search')" />
                <div class=" flex items-center gap-x-2">
                    <BLabel class="cursor-pointer" size="lg" :text="filter.label" @action="setFilter('')"
                        :color="filterProps(filter.key).color" v-for="filter in filters"
                        :icon="filterProps(filter.key).icon" :key="filter.key" @click="setFilter(filter.key)" />
                </div>
                <div class=" w-full h-90.5 mt-4 relative">
                    <div class="w-full h-full">
                        <BVirtualVerticalList :items="providers" @load-more="serviceStore.fetchProviders(true)"
                            :hasNextPage="serviceStore.hasProviderNextPage" :loading="isLoading">
                            <template #item="{ item: medic }">
                                <div class=" w-full pb-2">
                                    <MedicDisplay @click="toggleSelect(medic.id)" :isSelected="isSelected(medic.id)"
                                        :medic="medic" :expertise="selectedExpertiseLabel"
                                        :loading="isLoading && serviceStore.currentResultPage === 1" />
                                </div>
                            </template>
                        </BVirtualVerticalList>
                    </div>
                    <div
                        class="pt-6 bg-linear-to-b from-surface/0 via-surface to-surface absolute bottom-0 left-0 z-20 w-full">
                        <BButton :disabled="buttonProps.disabled" class=" min-w-full" :text="buttonProps.text"
                            @click="selectMedic" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, watch } from 'vue';
import { useServiceStore, useI18n } from '#imports';
import MedicDisplay from './MedicDisplay.vue';

export default defineComponent({
    name: 'MedicSelector',
    emits: ['close'],
    components: {
        MedicDisplay,
    },
    setup(_, { emit }) {
        const { t } = useI18n()
        const serviceStore = useServiceStore()
        const activeFilter = ref('')
        const autoSelect = ref(true)

        const field = computed({
            get: () => serviceStore.selectedServiceId,
            set: (val) => serviceStore.selectedServiceId = val
        })
        const searchText = computed({
            get: () => serviceStore.searchText,
            set: (val) => serviceStore.searchText = val
        })

        const isLoadingServices = computed(() => serviceStore.isLoadingServices)
        const isLoading = computed(() => serviceStore.isLoading)
        const providers = computed(() => serviceStore.providers)

        onMounted(() => {
            console.log(serviceStore.providers)
        })

        const selectedExpertiseLabel = computed(() => {
            const selected = serviceStore.services.find(s => s.id === field.value);
            return selected ? selected.label : t('chat.addMedic.select');
        });



        const filters = computed(() => [
            { key: 'available', label: t('chat.addMedic.available') },
            { key: 'online', label: t('chat.addMedic.online') },
        ]);

        const setFilter = (type: string) => {
            if (activeFilter.value === type) return;
            activeFilter.value = type;
        };

        const close = () => {
            emit('close')
        }

        const serviceOptions = computed(() =>
            serviceStore.services.map(service => ({
                label: service.label,
                value: service.id,
            }))
        );

        // Trigger the fetch when the selector opens
        onMounted(async () => {
            // 1. Fetch services first
            if (serviceStore.services.length === 0) {
                await serviceStore.fetchServices();
            }

            // 2. Set default expertise if none selected
            if (field.value === -1 && serviceStore.services.length > 0) {
                field.value = serviceStore.services[0].id;
            }
            await serviceStore.fetchProviders(false);
            console.log(providers.value)
        });

        // 2. Watcher: When filters, search, or expertise changes, reset and fetch providers
        watch([field, searchText, activeFilter], () => {
            serviceStore.resetProviderData();
            // Trigger initial fetch for the new parameters
            serviceStore.fetchProviders(false);
        }, { immediate: false });

        const filterProps = (type: string) => {
            return activeFilter.value === type
                ? { color: 'primary', icon: 'PhX' }
                : { color: 'neutral', icon: '' };
        };

        const selectedMedics = ref<number[]>([]);

        const toggleSelect = (id: number) => {
            if (isLoading.value) return
            const index = selectedMedics.value.indexOf(id);
            if (index > -1) {
                selectedMedics.value.splice(index, 1);
            } else {
                selectedMedics.value.push(id);
            }
        };


        const isSelected = (id: number) => selectedMedics.value.includes(id);

        const buttonProps = computed(() => {
            let buttonText = t('chat.addMedic.buttonText.single')
            let disabled = selectedMedics.value.length === 0;
            if (selectedMedics.value.length > 1) {
                buttonText = t('chat.addMedic.buttonText.multiple', { count: selectedMedics.value.length })
            }
            return {
                disabled: disabled,
                text: buttonText,
            }
        })

        watch(() => providers.value, () => {
            console.log(providers.value)
        })

        watch(() => autoSelect.value, () => {
            if (!autoSelect.value) {
                searchText.value = ''
                activeFilter.value = ''
            }
        })


        const selectMedic = () => {
            if (selectedMedics.value.length === 0) return
            emit('close')
        }


        return {
            t,
            isLoading,
            isLoadingServices,
            filterProps,
            toggleSelect,
            selectMedic,
            selectedExpertiseLabel,
            filters,
            searchText,
            setFilter,
            close,
            providers,
            buttonProps,
            serviceStore,
            serviceOptions,
            autoSelect,
            field,
            isSelected,
        }
    }
})
</script>