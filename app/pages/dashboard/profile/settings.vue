<template>
    <div class=" p-0 md:px-8 md:py-6 w-full">
        <div
            class=" w-full text-on-surface select-none md:border md:border-outline-variant rounded-2xl p-4 flex flex-col gap-y-4">
            <div class=" md:block hidden text-title-sm">{{ t('settings.title') }}</div>
            <div class=" text-label-md w-full flex flex-col gap-y-3">
                <div class=" w-full flex justify-between items-center rounded-xl h-18 bg-surface-variant px-3 ">
                    <div>{{ t('settings.theme') }}</div>
                    <ThemeSwitch />
                </div>
                <div class=" w-full flex justify-between items-center rounded-xl h-18 bg-surface-variant px-3 ">
                    <div>{{ t('settings.language') }}</div>
                    <BMenu>
                        <template #trigger="{ isOpen }">
                            <div class=" cursor-pointer flex items-center gap-x-2">
                                <div class=" flex items-center gap-x-2">
                                    <div class=" w-4 h-4">
                                        <span v-if="currentCountry?.code !== 'fa'"
                                            class="text-[8px] font-bold text-primary uppercase leading-none">
                                            {{ currentCountry?.code }}
                                        </span>
                                        <div v-else
                                            class=" rounded-full overflow-hidden w-full h-full flex items-center justify-center">
                                            <BImage class=" scale-125" :src="currentCountry?.flag" />
                                        </div>
                                    </div>
                                    <div class=" text-label-sm">{{ currentCountry.title }}</div>
                                </div>
                                <BIcon :class="[isOpen ? ' rotate-180' : ' rotate-0']"
                                    class=" transition-all duration-200 ease-in-out w-4 h-4 fill-on-surface "
                                    icon="PhCaretDown" />
                            </div>
                        </template>
                        <div class="w-60 p-3 flex flex-col gap-y-1">
                            <LocaleDisplay v-for="locale in languages" @click="switchLocale(locale.code)"
                                :locale="locale" :is-selected="isSelected(locale.code)" />
                        </div>
                    </BMenu>
                </div>
                <div class=" w-full flex justify-between items-center rounded-xl h-18 bg-surface-variant px-3 ">
                    <div>{{ t('settings.password') }}</div>
                    <BIcon icon="PhCaretLeft" class=" w-4 h-4 fill-on-surface" />
                </div>
                <div class=" w-full flex justify-between items-center rounded-xl h-18 bg-surface-variant px-3 ">
                    <div>{{ t('settings.installApp') }}</div>
                    <BIcon class=" cursor-pointer w-6 h-6 fill-primary" icon="PhDownloadSimple" />
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n, useLocale } from '#imports';
import ThemeSwitch from '~/components/general/ThemeSwitch.vue';
import LocaleDisplay from '~/components/layout/dashboard/sidebar/LocaleDisplay.vue';
definePageMeta({
    layout: 'responsive',
    headerTitle: 'seo.dashboard.settings.title',
    layoutTransition: false,
    title: 'seo.dashboard.settings.title',
    showMobileNav: true,
});
export default defineComponent({
    name: 'SettingsPage',
    components: {
        ThemeSwitch,
        LocaleDisplay,
    },
    setup() {
        const { t } = useI18n()
        const { languages, locale, switchLocale, currentCountry } = useLocale();

        const handleLocaleSwitch = (code: string) => {
            if (code === currentCountry.value?.code) return;
            switchLocale(code);
        };

        const isSelected = (lang: string) => {
            return lang === locale.value
        }


        return {
            t,
            languages,
            currentCountry,
            switchLocale,
            isSelected,
            handleLocaleSwitch,
        }
    }
})

</script>