<template>
    <div class=" flex items-center gap-x-6 w-full">
        <div class=" shrink-0 h-30 w-30">
            <BImage v-loading="isLoading" class=" w-full max-w-full max-h-full h-full min-w-full min-h-full"
                :src="greetingsImage" />
        </div>
        <div class=" flex-1 flex flex-col gap-y-1.5">
            <div v-loading="isLoading">
                <i18n-t  keypath="dashboard.greetings.hello" tag="span"
                    class="select-none text-head-sm text-on-surface">
                    <template #name>
                        <span class="text-primary">{{ firstName }}</span>
                    </template>
                </i18n-t>
            </div>
            <div class=" flex items-center gap-x-3">
                <div v-loading="isLoading" class=" shrink-0 py-0.5 px-3  rounded-lg bg-primary/20">
                    <div class=" select-none text-label-md text-primary">{{ t('dashboard.greetings.imBehno') }}</div>
                </div>
                <div v-loading="isLoading" class=" text-label-md select-none text-on-surface/50">{{
                    t('dashboard.greetings.text') }}
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useProfileStore } from '#imports';
import greetingsImage from '/images/dashboard/greetings.webp'
import { useI18n } from '#imports';
export default defineComponent({
    name: 'DashboardGreetings',
    setup() {
        const { t } = useI18n()
        const profileStore = useProfileStore()
        const firstName = computed(() => profileStore.userData.name)
        const isLoading = computed(() => profileStore.isLoading)


        return {
            t,
            isLoading,
            greetingsImage,
            firstName,
        }
    }
})
</script>