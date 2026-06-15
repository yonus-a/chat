<template>
    <div class="w-full flex max-h-[85vh] relative overflow-y-auto flex-col">
        <BSelect remoteSearch searchable v-model="selectedMedication.value" :options="medicationOptions"
            @search="handleMedSearch" :loading="isLoadingSearchResults" :color="selectedMedication.color"
            :message="selectedMedication.message" :placeholder="t('general.select')"
            :title="t('chat.prescription.medicationName')" :noResultText="t('chat.prescription.medicineSearch')" />
        <BSelect :title="t('chat.prescription.brands')" @search="searchMedications" :loading="isLoadingSearchResults"
            :placeholder="t('general.select')" :options="brandOptions" :disabled="brandOptions.length === 0"
            v-model="selectedBrand.value" :color="selectedBrand.color" :message="selectedBrand.message" />
        <BInput v-model="usageDose.value" :color="usageDose.color" :message="usageDose.message"
            :placeholder="t('general.write')" :title="t('chat.prescription.dose')" />
        <BInput :placeholder="t('general.write')" :title="t('chat.prescription.repetitionAmount')"
            v-model="repetitionAmount.value" :color="repetitionAmount.color" :message="repetitionAmount.message"
            type="number" :options="repetitionTypes" @select="handleRepetitionSelect"
            :selected-option-key="repetitionType" />
        <BInput textarea v-model="usageMethod.value" :color="usageMethod.color" :message="usageMethod.message"
            :title="t('chat.prescription.usageMethod')" :placeholder="t('general.write')" />
        <div class=" w-full">
            <BButton class="mt-2 lg:min-w-auto min-w-full w-full lg:w-auto" right-icon="PhPlus" :text="t('chat.prescription.addMedications')"
                type="outline" @click="validateFields" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue';
import { useI18n, useMedicationStore } from '#imports';
import type { MenuOption } from '~/types/components/menu-options';
import type { RepetitionTypes, PrescribedMedication } from '~/types/medication';

export default defineComponent({
    name: 'PrescriptionDetails',
    emits: ['add'],
    setup(props, { emit, expose }) {
        const { t } = useI18n();
        const medicationStore = useMedicationStore();

        const isLoadingSearchResults = computed(() => medicationStore.isLoading);
        const medicationOptions = computed(() => medicationStore.medicationOptions);
        const searchMedications = (searchText: string) => {
            medicationStore.searchMedications(searchText)
        }

        watch(() => isLoadingSearchResults.value, () => {
            console.log('loading search:', isLoadingSearchResults.value)
        })

        const repetitionTypes = computed<MenuOption[]>(() => [
            { key: 'day', label: t('calendar.form.repetition.day') },
            { key: 'hour', label: t('calendar.form.repetition.hour') },
        ]);

        const repetitionType = ref<RepetitionTypes>('day');
        const selectedMedication = ref({ value: '', color: 'primary', message: '' });
        const selectedBrand = ref({ value: '', color: 'primary', message: '' });
        const usageDose = ref({ value: '', color: 'primary', message: '' });
        const repetitionAmount = ref({ value: '', color: 'primary', message: '' });
        const usageMethod = ref({ value: '', color: 'primary', message: '' });

        // Search trigger
        const handleMedSearch = (query: string) => {
            medicationStore.searchMedications(query);
        };

        // Brand Options logic
        const brandOptions = computed(() => {
            if (!selectedMedication.value.value) return [];
            const med = medicationStore.medications.find(m => m.id === Number(selectedMedication.value.value));
            return med ? med.brands.map(b => ({ label: b.title, value: b.id })) : [];
        });

        // Watchers
        const clearError = (field: any) => {
            if (field.value.color === 'error') {
                field.value.color = 'primary';
                field.value.message = '';
            }
        };

        watch(() => selectedMedication.value.value, (newId) => {
            clearError(selectedMedication);
            selectedBrand.value.value = '';
            clearError(selectedBrand);

            if (newId) {
                const med = medicationStore.medications.find(m => m.id === Number(newId));
                if (med && med.brands.length === 1) {
                    selectedBrand.value.value = med.brands[0].id;
                }
            }
        });
        watch(() => selectedBrand.value.value, () => clearError(selectedBrand));
        watch(() => usageDose.value.value, () => clearError(usageDose));
        watch(() => repetitionAmount.value.value, () => clearError(repetitionAmount));
        watch(() => usageMethod.value.value, () => clearError(usageMethod));

        const validateFields = () => {
            let isValid = true;
            if (!selectedMedication.value.value) {
                selectedMedication.value.color = 'error';
                selectedMedication.value.message = t('validation.required', { field: t('chat.prescription.medicationName') });
                isValid = false;
            }
            if (!selectedBrand.value.value) {
                selectedBrand.value.color = 'error';
                selectedBrand.value.message = t('validation.required', { field: t('chat.prescription.brands') });
                isValid = false;
            }
            if (!usageDose.value.value.trim()) {
                usageDose.value.color = 'error';
                usageDose.value.message = t('validation.required', { field: t('chat.prescription.dose') });
                isValid = false;
            }
            if (!repetitionAmount.value.value.trim()) {
                repetitionAmount.value.color = 'error';
                repetitionAmount.value.message = t('validation.required', { field: t('chat.prescription.repetitionAmount') });
                isValid = false;
            }
            if (!usageMethod.value.value.trim()) {
                usageMethod.value.color = 'error';
                usageMethod.value.message = t('validation.required', { field: t('chat.prescription.usageMethod') });
                isValid = false;
            }

            if (isValid) {
                const med = medicationStore.medications.find(m => m.id === Number(selectedMedication.value.value));
                if (!med) return;

                const newPrescription: PrescribedMedication = {
                    id: Date.now(), // Mock ID
                    medication: med,
                    repetitionAmount: repetitionAmount.value.value,
                    usageMethod: usageMethod.value.value,
                    dose: usageDose.value.value,
                    period: {
                        period: repetitionType.value as 'day' | 'hour',
                        amount: Number(repetitionAmount.value.value)
                    }
                };
                emit('add', newPrescription);
                resetFields();
            }
        };

        const resetFields = () => {
            selectedMedication.value = { value: '', color: 'primary', message: '' };
            selectedBrand.value = { value: '', color: 'primary', message: '' };
            usageDose.value = { value: '', color: 'primary', message: '' };
            repetitionAmount.value = { value: '', color: 'primary', message: '' };
            usageMethod.value = { value: '', color: 'primary', message: '' };
            repetitionType.value = 'day';
        };

        expose({ reset: resetFields });

        const handleRepetitionSelect = (key: RepetitionTypes) => {
            repetitionType.value = key
        }

        return {
            t, validateFields, handleMedSearch, isLoadingSearchResults,
            medicationOptions, brandOptions,
            selectedMedication, selectedBrand, usageDose, repetitionAmount, usageMethod,
            repetitionTypes, repetitionType, searchMedications, handleRepetitionSelect,
        };
    }
});
</script>