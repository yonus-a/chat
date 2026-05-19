<template>
    <div class=" flex w-10 h-10 absolute top-0 left-0 z-10000 items-center justify-center">
        <BMenu :overlay="false">
            <template #trigger="{ isOpen }">
                <div class="w-full aspect-square flex items-center justify-center">
                    <div class="cursor-pointer w-5 h-5 rounded-full overflow-hidden border border-outline/20 transition-all duration-200 flex items-center justify-center"
                        :class="[
                            isOpen ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface' : '',
                            currentCountry?.code !== 'fa' ? 'bg-primary/5' : ''
                        ]">
                        <BImage v-if="currentCountry?.code === 'fa'" class="w-full h-full min-w-full min-h-full"
                            fit="cover" :src="currentCountry?.flag" />
                        <span v-else class="text-[8px] font-bold text-primary uppercase leading-none">
                            {{ currentCountry?.code }}
                        </span>
                    </div>
                </div>
            </template>

            <div class="w-60 p-3 flex flex-col gap-y-1">
                <LocaleDisplay v-for="locale in languages" @click="switchLocale(locale.code)" :locale="locale"
                    :is-selected="isSelected(locale.code)" />
            </div>
        </BMenu>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useLocale } from '#imports';
import LocaleDisplay from './LocaleDisplay.vue';

export default defineComponent({
    name: 'SidebarLocaleSwitch',
    components: {
        LocaleDisplay,
    },
    setup() {
        const { languages, locale, switchLocale, currentCountry } = useLocale();

        const handleLocaleSwitch = (code: string) => {
            if (code === currentCountry.value?.code) return;
            switchLocale(code);
        };

        const isSelected = (lang: string) => {
            return lang === locale.value
        }



        return {
            switchLocale,
            isSelected,
            handleLocaleSwitch,
            currentCountry,
            languages,
        }
    }
})
</script>