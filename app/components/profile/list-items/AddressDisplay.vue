<template>
    <div
        class=" w-full px-5 flex  items-center justify-between gap-x-5 py-2 rounded-xl bg-surface-variant select-none text-on-surface">
        <BIcon v-loading="isLoading" icon="PhMapTrifold" class=" fill-primary w-8 h-8 shrink-0" />
        <div class=" flex-1 shrink-0 flex flex-col gap-y-1">
            <div v-loading="isLoading" class=" text-body-sm opacity-50 ">{{ address.title }}</div>
            <div v-loading="isLoading" class=" max-w-full text-label-md overflow-hidden text-ellipsis line-clamp-1">
                {{ address.path }}
            </div>
            <div class=" flex items-center gap-x-2">
                <div v-loading="isLoading" class=" opacity-50 text-body-md">{{ t('profile.address.postalCode') }}</div>
                <div v-loading="isLoading" class=" text-label-md">{{ address.postalCode }}</div>
            </div>
        </div>
        <BMenu :options="menuOptions" @select="handleOptionSelect">
            <template #trigger>
                <BIcon v-loading="isLoading" icon="PhDotsThreeVertical" weight="bold"
                    class=" w-5 aspect-square  fill-on-surface"
                    :class="[!isLoading ? 'cursor-pointer pointer-events-auto' : ' pointer-events-none']" />
            </template>
        </BMenu>
    </div>
</template>
<script lang="ts">
import { defineComponent, type PropType, computed } from 'vue';
import { useI18n } from '#imports';
import type { Address } from '~/types/address';
import type { MenuOption } from '~/types/components/menu-options';
export default defineComponent({
    name: 'AddressDisplay',
    props: {
        address: {
            type: Object as PropType<Address>,
            required: true,
        },
        loading: {
            type: Boolean,
            default: true,
        }
    },
    emits: ['main', 'edit', 'edit'],
    setup(props, { emit }) {
        const { t } = useI18n()
        const isLoading = computed(() => props.loading)

        const menuOptions = computed<MenuOption[]>(() => [
            {
                key: 'main',
                icon: 'PhMapPin',
                label: t('profile.address.options.selectAsMain'),
            },
            {
                key: 'edit',
                icon: 'PhPencilSimple',
                label: t('profile.address.options.edit'),
            },
            {
                key: 'delete',
                icon: 'PhTrash',
                label: t('profile.address.options.delete'),
                color: 'error'
            },
        ])

        const handleOptionSelect = (key: string) => {
            switch (key) {
                case 'main':

                    break;
                case 'edit':

                    break;
                case 'delete':

                    break;
            }
        }

        return {
            t,
            handleOptionSelect,
            menuOptions,
            isLoading,
        }
    }
})

</script>