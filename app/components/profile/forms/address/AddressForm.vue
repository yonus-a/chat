<template>
    <div class=" w-dvw py-4 px-6 md:max-w-98 flex justify-center">
        <div class=" w-98 flex flex-col select-none text-on-surface gap-y-4">
            <div class=" flex items-center gap-x-3">
                <BIcon icon="PhX" class=" cursor-pointer w-5 h-5 fill-on-surface/50" />
                <div class=" text-label-sm ">{{ t('profile.address.options.add') }}</div>
            </div>
            <AddressMap @request-location-permission="$emit('request-permission')" @map-center="handleMapCenter" />
            <div class=" w-full">
                <BInput :title="t('profile.address.form.addressTitle')" :placeholder="t('general.write')"
                    v-model="addressTitle.value" :color="addressTitle.color" :message="addressTitle.message" />
                <div class=" w-full flex items-center gap-x-3">
                    <BSelect :title="t('profile.address.form.province')" :placeholder="t('general.select')"
                        v-model="chosenProvince.value" :color="chosenProvince.color"
                        :message="chosenProvince.message" />
                    <BSelect :title="t('profile.address.form.city')" :placeholder="t('general.select')"
                        v-model="chosenCity.value" :color="chosenCity.color" :message="chosenCity.message" />
                </div>
                <BInput :title="t('profile.address.form.postalCode')" type="number" :placeholder="t('general.write')"
                    v-model="postalCode.value" :color="postalCode.color" :message="postalCode.message" />
                <BInput :title="t('profile.address.form.address')" :placeholder="t('general.write')"
                    v-model="addressText.value" :color="addressText.color" :message="addressText.message" />
                <BCheckBox :label="t('profile.address.form.selectAsMain')" v-model="selectAsMain" />
            </div>
            <BButton :text="t('profile.address.submit')" class=" min-w-full" @click="validateFields"
                :disabled="hasErrors" :loading="isSending" />
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, type PropType, ref, computed, watch } from 'vue';
import { useI18n, useAppToast } from '#imports';
import type { Address } from '~/types/address';
import AddressMap from './AddressMap.vue';
export default defineComponent({
    name: 'AddressForm',
    props: {
        address: {
            type: Object as PropType<Address>,
            default: () => { }
        }
    },
    components: {
        AddressMap,
    },
    emits: ['close', 'request-permission'],
    setup(props, { emit }) {
        const { t } = useI18n()
        const { openToast } = useAppToast()
        const isSending = ref(false)
        const hasErrors = ref(false)
        const selectAsMain = ref(false)

        const mapCenter = ref<{ lat: number; lng: number } | null>(null)
        const handleMapCenter = (payload: { lat: number; lng: number }) => {
            mapCenter.value = payload
        }

        const addressTitle = ref({
            value: '', color: 'primary', message: ''
        })
        const postalCode = ref({
            value: '', color: 'primary', message: ''
        })
        const addressText = ref({
            value: '', color: 'primary', message: ''
        })

        const chosenProvince = ref({
            value: '', color: 'primary', message: ''
        })

        const chosenCity = ref({
            value: '', color: 'primary', message: ''
        })

        const validateFields = () => {
            if (hasErrors.value || isSending.value) return

            if (!hasErrors.value) {
                submitAddress()
            }
        }

        const submitAddress = async () => {
            isSending.value = true;
            try {

            } catch (error) {

            } finally {
                isSending.value = false;
            }
        }

        return {
            t,
            addressTitle,
            postalCode,
            addressText,
            chosenProvince,
            chosenCity,
            handleMapCenter,
            selectAsMain,
            validateFields,
            hasErrors,
            isSending,
        }
    }
})
</script>