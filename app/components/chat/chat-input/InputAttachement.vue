<template>
    <div>
        <BMenu ref="attachementMenu">
            <template #trigger>
                <BIcon icon="PhPaperclip" class=" cursor-pointer w-6 h-6 fill-on-surface shrink-0" />
            </template>
            <div class=" w-41 bg-surface rounded-2xl p-3 flex flex-col gap-y-1">
                <div @click="handleAttachementOption(option.key)" v-for="option in attachementOptions" :key="option.key"
                    class=" px-3 transition-all duration-200 ease-in-out bg-surface-variant-2/0 hover:bg-surface-variant-2 cursor-pointer select-none w-full flex items-center gap-x-2 h-11 rounded-xl ">
                    <BIcon :icon="option.icon" class=" w-5 h-5 fill-on-surface/50" />
                    <div class=" text-body-sm text-on-surface/70">{{ option.title }}</div>
                </div>
            </div>
        </BMenu>
    </div>
</template>
<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { useI18n } from '#imports';
import type { Menu } from '~/types/components/menu';


export default defineComponent({
    name: 'InputAttachement',
    setup() {
        const { t } = useI18n()
        const attachementMenu = ref<Menu | null>(null)

        const attachementOptions = computed(() => [
            {
                icon: 'PhImage',
                key: 'media',
                title: t('chat.file.attachMedia')
            },
            {
                icon: 'PhFile',
                key: 'file',
                title: t('chat.file.attachFile')
            },
        ])

        const handleAttachementOption = (action: string) => {
            attachementMenu.value?.close()
        }

        return {
            attachementMenu,
            attachementOptions,
            handleAttachementOption,
        }
    }
})
</script>