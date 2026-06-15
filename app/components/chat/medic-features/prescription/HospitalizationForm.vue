<template>
    <div class="w-full flex flex-col ">
        <BSelect 
            :placeholder="t('general.select')" 
            :title="t('chat.prescription.priority.title')" 
            :options="priorities"
            v-model="priority.value" 
            :color="priority.color" 
            :message="priority.message" 
        />
        <BInput 
            :title="t('chat.prescription.timePeriod')" 
            :placeholder="t('general.write')" 
            v-model="period.value"
            :color="period.color" 
            :message="period.message" 
        />
        <BInput 
            textarea
            :title="t('chat.prescription.descriptions')" 
            :placeholder="t('general.write')"
            v-model="descriptions.value" 
            :color="descriptions.color" 
            :message="descriptions.message" 
        />
        <BButton 
            @click="validateFields" 
            class="min-w-full mt-2" 
            :text="t('chat.prescription.submit')"
            :loading="loading" 
        />
    </div>
</template>

<script lang="ts">
import { defineComponent, watch, computed, ref } from 'vue';
import { useI18n } from '#imports';

export default defineComponent({
    name: 'HospitalizationForm',
    props: { loading: { type: Boolean, default: false } },
    emits: ['submit'],
    setup(props, { emit, expose }) {
        const { t } = useI18n();
        
        const priority = ref({ value: '', color: 'primary', message: '' });
        const period = ref({ value: '', color: 'primary', message: '' });
        const descriptions = ref({ value: '', color: 'primary', message: '' });

        const priorities = computed(() => [
            { label: t('chat.prescription.priority.high'), value: 'high' },
            { label: t('chat.prescription.priority.medium'), value: 'medium' },
            { label: t('chat.prescription.priority.low'), value: 'low' },
        ]);

        // Watchers to clear errors
        const clearError = (field: any) => {
            if (field.value.color === 'error') {
                field.value.color = 'primary';
                field.value.message = '';
            }
        };
        watch(() => priority.value.value, () => clearError(priority));
        watch(() => period.value.value, () => clearError(period));
        watch(() => descriptions.value.value, () => clearError(descriptions));

        const validateFields = () => {
            let isValid = true;
            
            if (!priority.value.value) {
                priority.value.color = 'error';
                priority.value.message = t('validation.required', { field: t('chat.prescription.priority.title') });
                isValid = false;
            }
            if (!period.value.value.trim()) {
                period.value.color = 'error';
                period.value.message = t('validation.required', { field: t('chat.prescription.timePeriod') });
                isValid = false;
            }
            if (!descriptions.value.value.trim()) {
                descriptions.value.color = 'error';
                descriptions.value.message = t('validation.required', { field: t('chat.prescription.descriptions') });
                isValid = false;
            }

            if (isValid) {
                emit('submit', {
                    priority: priority.value.value,
                    period: period.value.value,
                    descriptions: descriptions.value.value
                });
            }
        };

        const reset = () => {
            priority.value = { value: '', color: 'primary', message: '' };
            period.value = { value: '', color: 'primary', message: '' };
            descriptions.value = { value: '', color: 'primary', message: '' };
        };

        expose({ reset });

        return { t, priorities, priority, period, descriptions, validateFields };
    }
});
</script>