<template>
    <BPopup ref="popup" no-padding :has-close="false" @closed="onClosed">
        <div ref="popupContent" :class="[selectedPeriod.value !== '' ? 'overflow-y-auto ' : ' overflow-visible']"
            class="w-full flex lg:gap-y-0 gap-y-4 gap-x-4 px-6 flex-col lg:pt-4 lg:flex-row max-h-[85vh] pb-6 items-start lg:justify-center transition-all duration-300 ease-in-out">

            <div v-show="!isMobile || step === 1" class="w-full relative   lg:w-86 shrink-0 transition-all">
                <div class=" w-full ">

                    <div class="mb-4 flex items-center gap-x-3">
                        <BIcon icon="PhX" class="cursor-pointer w-4 h-4 fill-on-surface" @click="closePopup" />
                        <div class="select-none text-on-surface text-label-sm">{{ t('chat.prescription.title') }}</div>
                    </div>

                    <div class="">
                        <BSelect :options="periodOptions" v-model="selectedPeriod.value" :color="selectedPeriod.color"
                            :message="selectedPeriod.message" :title="t('chat.prescription.initialDetection')"
                            :placeholder="t('general.select')" />
                    </div>

                    <Transition name="form-fade" mode="out-in">
                        <HospitalizationForm v-if="selectedPeriod.value === 'hospitalization'" ref="hospForm"
                            :loading="isSending" @submit="handleHospitalization" />

                        <PrescriptionDetails v-else-if="selectedPeriod.value === 'prescription'" ref="prescDetails"
                            @add="addMedication" />
                    </Transition>
                    <div v-if="isMobile && selectedPeriod.value === 'prescription' && prescribedMeds.length > 0"
                        class="mt-4 ">
                        <MedicationsList @delete="deleteMedicine" :medications="prescribedMeds" mode="responsive" />
                    </div>
                    <div class=" lg:hidden transition-all duration-200 ease-in-out "
                        :class="[prescribedMeds.length === 0 || selectedPeriod.value !== 'prescription' ? ' h-0' : 'h-15']">
                    </div>
                </div>
                <div v-if="selectedPeriod.value === 'prescription'"
                    class=" right-0 px-6 bg-linear-to-b  z-10005 py-4 w-full fixed min-w-full lg:hidden bottom-0"
                    :class="[prescribedMeds.length === 0 ? 'from-surface/0 to-surface/0 pointer-events-none' : ' pointer-events-auto from-surface/0 to-surface']">
                    <BButton class="w-full min-w-full transition-all duration-200 ease-in-out "
                        :class="[prescribedMeds.length === 0 ? ' translate-y-[200%]' : 'translate-y-0']"
                        :text="t('chat.prescription.continue')" @click="goToStep(2)" />
                </div>
            </div>

            <Transition :name="isMobile ? '' : 'width-expand'">
                <div v-show="(!isMobile || step === 2) && selectedPeriod.value === 'prescription' && prescribedMeds.length > 0"
                    class="lg:w-102 w-full flex flex-col  lg:h-160 max-h-[75vh] h-auto">

                    <MedicationsList @delete="deleteMedicine" class="flex-1 min-h-0 overflow-y-auto"
                        :medications="prescribedMeds" :mode="isMobile ? 'full' : 'responsive'" />

                    <div class="w-full flex gap-x-3 justify-end items-center mt-4 shrink-0">
                        <BButton v-if="isMobile && step === 2" color="secondary" :disabled="isSending"
                            class="flex-1 lg:hidden" :text="t('chat.prescription.back')" @click="goToStep(1)" />

                        <BButton class="flex-1  lg:max-w-90 w-full" :loading="isSending"
                            :text="t('chat.prescription.submit')" @click="handlePrescription" />
                    </div>
                </div>
            </Transition>
        </div>
    </BPopup>
</template>

<script lang="ts">
import { defineComponent, useTemplateRef, computed, ref, watch } from 'vue';
import { useChatActionStore, useI18n, useWindowSize, useAppToast } from '#imports';
import type { Popup } from '~/types/components/popup';
import type { PrescribedMedication } from '~/types/medication';
import type { DropdownOption } from '~/types/components/select';
import PrescriptionDetails from './prescription/PrescriptionDetails.vue';
import MedicationsList from './prescription/MedicationsList.vue';
import HospitalizationForm from './prescription/HospitalizationForm.vue';

export default defineComponent({
    name: 'PrescriptionDisplay',
    components: { PrescriptionDetails, MedicationsList, HospitalizationForm },
    setup() {
        const { t } = useI18n();
        const chatActionStore = useChatActionStore();
        const { width } = useWindowSize();
        const { openToast } = useAppToast();

        const popup = useTemplateRef<Popup>('popup');
        const hospForm = useTemplateRef<any>('hospForm');
        const prescDetails = useTemplateRef<any>('prescDetails');
        const popupContent = useTemplateRef<HTMLElement>('popupContent')

        const isMobile = computed(() => width.value < 1024);
        const step = ref(1);
        const isTransitioning = ref(false);
        const isSending = ref(false);

        const prescribedMeds = ref<PrescribedMedication[]>([]);
        const selectedPeriod = ref({ value: '', color: 'primary', message: '' });

        const periodOptions = computed<DropdownOption[]>(() => [
            { value: 'hospitalization', label: t('chat.prescription.periodOptions.hospitalization') },
            { value: 'prescription', label: t('chat.prescription.periodOptions.prescriptionDrugs') }
        ]);

        watch(() => selectedPeriod.value.value, () => {
            if (selectedPeriod.value.color === 'error') {
                selectedPeriod.value.color = 'primary';
                selectedPeriod.value.message = '';
            }
        });

        // Bus listener
        const unsubscribe = chatActionStore.prescriptionBus.on((conversationId) => {
            popup.value?.open();
        });

        const addMedication = (med: PrescribedMedication) => {
            prescribedMeds.value.push(med);
        };


        const scrollToBottom = () => {
            nextTick(() => {
                if (popupContent.value) {
                    popupContent.value.scrollTo({
                        top: popupContent.value.scrollHeight,
                        behavior: 'smooth'
                    });
                }
            });
        };

        watch(
            () => prescribedMeds.value.length,
            (newLength, oldLength) => {
                if (newLength === 1 && oldLength === 0) {
                    setTimeout(() => {
                        scrollToBottom();
                    }, 200)
                }
            }
        );

        const goToStep = (targetStep: number) => {
            if (isTransitioning.value) return;
            isTransitioning.value = true;
            popup.value?.close();
            setTimeout(() => {
                step.value = targetStep;
                popup.value?.open();
                setTimeout(() => { isTransitioning.value = false; }, 300);
            }, 300);
        };

        const handleHospitalization = async (data: any) => {
            isSending.value = true;
            try {
                // Mock API Delay
                await new Promise(res => setTimeout(res, 1500));
                openToast(t('chat.prescription.hospitalizationSuccess'), 'success');
                closePopup();
            } finally {
                isSending.value = false;
            }
        };

        const handlePrescription = async () => {
            if (prescribedMeds.value.length === 0) {
                openToast(t('chat.prescription.emptyList'), 'error');
                return;
            }
            isSending.value = true;
            try {
                // Mock API Delay
                await new Promise(res => setTimeout(res, 1500));
                openToast(t('chat.prescription.success'), 'success');
                closePopup();
            } finally {
                isSending.value = false;
            }
        };

        const onClosed = () => {
            if (isTransitioning.value) return;
            // Fully reset state when user explicitly closes or after success
            selectedPeriod.value = { value: '', color: 'primary', message: '' };
            prescribedMeds.value = [];
            step.value = 1;
            hospForm.value?.reset();
            prescDetails.value?.reset();
        };

        const closePopup = () => {
            popup.value?.close();
        };

        const deleteMedicine = (index: number) => {
            prescribedMeds.value.splice(index, 1);
        };

        return {
            t, periodOptions, popup, hospForm, prescDetails,
            selectedPeriod, prescribedMeds, step, isMobile, isSending,
            addMedication, goToStep, handleHospitalization, handlePrescription,
            closePopup, onClosed, popupContent, deleteMedicine,
        };
    }
});
</script>
<style scoped>
/* Vertical Form Animation */
.form-fade-enter-active,
.form-fade-leave-active {
    transition: opacity 0.2s ease-in-out;
}

.form-fade-enter-from,
.form-fade-leave-to {
    opacity: 0;
}

.form-fade-enter-to,
.form-fade-leave-from {
    opacity: 1;
}

/* Horizontal List Animation */
.width-expand-enter-active,
.width-expand-leave-active {
    transition: all 0.3s ease-in-out;
    overflow: hidden;
    white-space: nowrap;
}

.width-expand-enter-from,
.width-expand-leave-to {
    opacity: 0;
    max-width: 0;
    padding-left: 0 !important;
    padding-right: 0 !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
}

.width-expand-enter-to,
.width-expand-leave-from {
    opacity: 1;
    max-width: 408px;
    /* lg:w-102 equates to approx 25.5rem or 408px */
}
</style>