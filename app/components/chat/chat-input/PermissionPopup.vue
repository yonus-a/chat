<template>
    <BPopup no-padding ref="popup">
        <div class=" w-dvw max-w-120">
            <div class=" flex items-center p-5 gap-x-2 w-full border-b border-b-outline-variant">
                <BIcon :icon="popupIcon.icon" :class="[popupIcon.color]" class=" w-7 h-7" weight="fill" />
                <div class=" select-none  text-on-surface text-label-lg">{{ popupContent.title }}</div>
            </div>
            <div class="border-b text-wrap border-b-outline-variant w-full p-5 select-none">
                <p class=" text-body-md text-on-surface/50">{{ popupContent.description }}</p>
            </div>
            <div class=" w-full flex items-center p-5 gap-x-3">
                <BButton :text="actionButtonText" :loading="isLoading" @click="handleAction" />
                <BButton @click="closePopup" color="secondary" type="outline" :text="t('chat.permissions.notNow')" />
            </div>
        </div>
    </BPopup>
</template>
<script lang="ts">
import { defineComponent, nextTick } from 'vue';
import { useI18n } from '#imports';
import type { Popup } from '~/types/components/popup';
type popupStates = 'permission' | 'mic-error' | 'cam-error'

export default defineComponent({
    name: 'PermissionPopup',
    emits: ['action', 'cancel'],
    setup(_, { expose, emit }) {
        const popup = ref<Popup | null>(null)
        const { t } = useI18n()
        const popupMode = ref<popupStates>('permission')
        const isLoading = ref(false)



        const popupIcon = computed(() => {
            return {
                icon: popupMode.value === 'permission' ? 'PhWarningCircle' : 'PhWarningOctagon',
                color: popupMode.value === 'permission' ? 'fill-primary' : 'fill-error'
            }
        })

        const actionButtonText = computed(() => popupMode.value === 'permission' ? t('chat.permissions.allow') : t('chat.permissions.retry'))

        const popupContent = computed(() => {
            switch (popupMode.value) {
                case 'permission':
                    return {
                        title: t('chat.permissions.permissionTitle'),
                        description: t('chat.permissions.description')
                    }
                case 'cam-error':
                    return {
                        title: t('chat.permissions.micError.title'),
                        description: t('chat.permissions.micError.description')
                    }
                case 'mic-error':
                    return {
                        title: t('chat.permissions.camError.title'),
                        description: t('chat.permissions.camError.description')
                    }
            }
        })

        const openPopup = (state: popupStates) => {
            popupMode.value = state;
            isLoading.value = false;
            nextTick(() => {
                popup.value?.open()
            })
        }

        expose({
            open: (state: popupStates) => { openPopup(state) },
            close: () => { closePopup() },
            setLoading: (state: boolean) => { isLoading.value = state; }
        });

        const closePopup = () => {
            popup.value?.close();
            emit('cancel');
        }

        const handleAction = () => {
            isLoading.value = true;
            emit('action', popupMode.value);
        }

        return {
            actionButtonText,
            popup,
            closePopup,
            t,
            popupIcon,
            popupContent,
            isLoading,
            handleAction,
        }
    }
})

</script>