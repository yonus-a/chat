<template>
    <BPopup @closed="onPopupClose" ref="popup" no-padding>
        <div class=" w-dvw max-w-98 py-4 px-6">
            <div class=" select-none flex items-center gap-x-3">
                <BIcon icon="PhX" class=" w-6 h-6 cursor-pointer fill-on-surface/50" />
                <div class=" text-label-sm text-on-surface">{{ t('calendar.share.title') }}</div>
            </div>
            <div class=" mt-4 w-full">
                <BInput @action="copy" :placeholder="t('calendar.share.link')" readonly :icon="inputIcon"
                    v-model="shareUrl" />
                <BSelect v-model="selectedUsers" :placeholder="t('general.select')" :title="t('calendar.share.addUser')"
                    :no-result-text="t('calendar.share.noUsers')" />
            </div>
        </div>
    </BPopup>
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useI18n, useAppToast, useProfileStore } from '#imports';
import type { Popup } from '~/types/components/popup';

export default defineComponent({
    name: 'SharePopup',
    setup(_, { expose }) {
        const { t } = useI18n()
        const { openToast } = useAppToast()
        const profileStore = useProfileStore()
        const popup = ref<Popup | null>(null)
        const shareUrl = ref('ajdhgsguo.ir/kjsfgh/jkefgh')
        const isCopied = ref(false)
        const selectedUsers = ref([])
        const isLoading = computed(() => profileStore.isLoadingFamilyMembers)
        const familyMembers = computed(() => {

        })

        const inputIcon = computed(() => isCopied.value ? 'PhCheckCircle' : 'PhCopy')

        const open = () => {
            popup.value?.open()
        }

        const close = () => {
            popup.value?.close()
        }

        const onPopupClose = () => {
            isCopied.value = false;
        }

        const copy = () => {
            isCopied.value = true;
            openToast(t('calendar.share.copySuccess'), 'success')
        }

        expose({
            open, close
        })


        return {
            copy,
            selectedUsers,
            t,
            onPopupClose,
            inputIcon,
            popup,
            shareUrl,
        }
    }
})
</script>