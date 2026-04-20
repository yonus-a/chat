<template>
    <div class=" w-full border border-outline-variant flex flex-col gap-y-2 bg-surface rounded-xl p-2.5">
        <div class="flex items-center w-min gap-x-3 px-2 rounded-lg bg-primary/10">
            <div class=" shrink-0 w-2 h-2 relative">
                <div class=" rounded-full w-full h-full bg-gradient-primary-secondary"></div>
                <div
                    class=" rounded-full w-full h-full bg-gradient-primary-secondary absolute inset-0 top-0 left-0 animate-ping">
                </div>
            </div>
            <div class=" shrink-0 select-none text-primary text-label-sm">{{ supportPhone }}</div>
            <BIcon class=" shrink-0 fill-primary w-5 h-5" icon="PhPhoneCall" />
        </div>
        <NuxtLinkLocale to="/dashboard/suggestions"
            class=" cursor-pointer select-none w-full flex items-center gap-x-2">
            <BIcon icon="PhHeadset" class="  w-5 h-5 fill-on-surface/50" />
            <div class=" text-body-sm text-on-surface/70">{{ t('sidebar.suggestions') }}</div>
        </NuxtLinkLocale>
    </div>
</template>
<script lang="ts">
import { ref, defineComponent } from 'vue';
import { useI18n } from '#imports';

export default defineComponent({
    name: 'ContactCard',
    setup() {
        const { t } = useI18n()
        const supportPhone = ref('3747')


        return {
            t,
            supportPhone,
        }
    }
})
</script>