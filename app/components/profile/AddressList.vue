<template>
    <div class=" w-full rounded-2xl select-none flex flex-col gap-y-4 md:p-4 md:border md:border-outline-variant">
        <div class=" w-full flex justify-between items-center">
            <div class=" text-on-surface text-title-sm">{{ t('profile.address.title') }}</div>
            <BButton left-icon="PhPlus" :text="t('profile.address.options.add')" type="ghost" @click="addAddress" />
        </div>
        <div class=" w-full" v-if="!isLoadingAddresses && addresses.length === 0">
            <NoDataDisplay :image-path="noAddressImage" :title="t('profile.address.noAddress')" />
        </div>
        <div class=" w-full flex flex-col gap-y-3">
            <AddressDisplay :loading="isLoadingAddresses" v-for="address in addresses" :key="address.id"
                :address="address" />
        </div>
        <BPopup ref="popup" no-padding>
            <LocationPermission @allowed="openPopup('form')" v-show="popupMode === 'location'" @close="closePopup" />
            <AddressForm @close="closePopup" @request-permission="openPopup('location')"
                v-show="popupMode === 'form'" />
        </BPopup>
    </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, useTemplateRef } from 'vue';
import { useProfileStore, useI18n } from '#imports';
import type { Popup } from '~/types/components/popup';
import NoDataDisplay from '../general/NoDataDisplay.vue';
import noAddressImage from '/images/profile/no-addresses.webp'
import type { Address } from '~/types/address';
import AddressDisplay from './list-items/AddressDisplay.vue';
import LocationPermission from './forms/address/LocationPermission.vue';
import AddressForm from './forms/address/AddressForm.vue';
type PopupModes = 'location' | 'form'
export default defineComponent({
    name: 'AddressList',
    components: {
        LocationPermission,
        NoDataDisplay,
        AddressDisplay,
        AddressForm,
    },
    setup() {
        const popup = useTemplateRef<Popup>('popup')
        const popupMode = ref<PopupModes>('location')
        const isPopupOpen = ref(false)
        const { t } = useI18n()
        const profileStore = useProfileStore()
        const isLoadingAddresses = computed(() => !profileStore.isAddressesLoaded)


        const mockAddress: Address = {
            id: 0,                     // dummy id
            date: String(new Date()),
            longitude: '0.000000',
            latitude: '0.000000',
            title: '---',
            path: '---',
            postalCode: '---',
            cityId: 0,
            provinceId: 0,
            isMain: false,
        };

        const addresses = computed(() => {
            if (isLoadingAddresses.value) {
                return Array.from({ length: 3 }, (_, i) => ({ ...mockAddress, id: i + 1 }));
            }
            return profileStore.addresses;
        });

        onMounted(() => {
            if (!profileStore.isAddressesLoaded) {
                profileStore.loadAddresses()
            }
        })

        const addAddress = () => {
            openPopup('form')
        }

        const openPopup = (mode: PopupModes) => {
            if (isPopupOpen.value) {
                popup.value?.close()
                setTimeout(() => {
                    popupMode.value = mode
                    popup.value?.open()
                    isPopupOpen.value = true;
                }, 300)
            } else {
                popupMode.value = mode;
                popup.value?.open()
                isPopupOpen.value = true;
            }
        }

        const closePopup = () => {
            popup.value?.close()
            isPopupOpen.value = false;
        }


        return {
            t,
            popup,
            addresses,
            noAddressImage,
            isLoadingAddresses,
            openPopup,
            addAddress,
            closePopup,
            popupMode,
        }
    }
})
</script>