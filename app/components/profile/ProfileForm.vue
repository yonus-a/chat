<template>
    <div class=" w-full rounded-2xl flex flex-col gap-y-4 md:p-4 md:border md:border-outline-variant">
        <div class=" w-full flex items-center justify-between">
            <div class=" text-title-sm text-on-surface select-none">{{ t('profile.profile.title') }}</div>
            <BButton @click="openEdit" type="ghost" :text="t('profile.profile.edit')" left-icon="PhPencilSimpleLine" />
        </div>
        <div class=" w-full flex items-center justify-between bg-surface-variant rounded-xl px-2 py-3 gap-x-3">
            <div class=" w-12 rounded-full overflow-hidden aspect-square shrink-0">
                <BImage v-loading="isLoading" :src="profileStore.userData.imageUrl"
                    class=" w-full h-full min-w-full min-h-full max-w-full max-h-full" />
            </div>
            <div class=" flex-1 select-none text-on-surface flex flex-col gap-y-1">
                <div v-loading="isLoading" class=" text-body-sm opacity-50">{{ t('profile.profile.image.image') }}</div>
                <div @click="openImagePicker" v-loading="isLoading" class=" text-primary cursor-pointer text-label-md">
                    {{ t('profile.profile.image.edit') }}</div>
            </div>
            <div class=" text-label-md  text-on-surface" v-loading="isLoading">{{ profileStore.userData.phoneNumber }}</div>
        </div>
        <div class=" w-full grid sm:grid-cols-2 grid-cols-1 lg:grid-cols-3 gap-3">
            <DetailsInput v-for="(field, index) in fields" :key="index" :field="field" :loading="isLoading" />
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, computed, useTemplateRef } from 'vue';
import { useDate, useI18n, useProfileStore } from '#imports';
import type { Popup } from '~/types/components/popup';
import type { ProfileFieldProps } from './DetailsInput.vue';
import DetailsInput from './DetailsInput.vue';
export default defineComponent({
    name: 'ProfileForm',
    components: {
        DetailsInput,
    },
    setup() {
        const { formatDateShort } = useDate()
        const { t } = useI18n()
        const profileStore = useProfileStore()
        const popup = useTemplateRef<Popup>('popup')
        const isLoading = computed(() => profileStore.isLoading)

        const fields = computed<ProfileFieldProps[]>(() => {
            const d = profileStore.userData;
            const nationalIdTitle = d.nationality === 'foriegner'
                ? t('profile.profile.foreignCode')
                : t('profile.profile.fields.nationalCode');

            const nationalityText = d.nationality
                ? t(`general.nationality.${d.nationality}`)
                : null;
            const relationshipText = d.relationShipStatus
                ? t(`general.relationshipStatus.${d.relationShipStatus}`)
                : null;
            return [
                { id: 'name', title: t('profile.profile.fields.name'), value: d.name ?? null },
                { id: 'lastName', title: t('profile.profile.fields.lastName'), value: d.lastName ?? null },
                { id: 'nationalCode', title: nationalIdTitle, value: d.nationalId ?? null },
                { id: 'email', title: t('profile.profile.fields.email'), value: d.email ?? null },
                { id: 'birthDate', title: t('profile.profile.fields.birthDate'), value: formatDateShort(new Date(d.birthDate)) ?? null },
                { id: 'placeOfBirth', title: t('profile.profile.fields.placeOfBirth'), value: d.placeOfBirth ?? null },
                { id: 'relationShipStatus', title: t('profile.profile.fields.relationShipStatus'), value: relationshipText },
                { id: 'nationality', title: t('profile.profile.fields.nationality'), value: nationalityText }
            ] as ProfileFieldProps[];
        });

        const openEdit = () => [
            popup.value?.open()
        ]


        const openImagePicker = () => {

        }

        return {
            t,
            profileStore,
            openImagePicker,
            isLoading,
            fields,
            openEdit,
        }
    }
})
</script>