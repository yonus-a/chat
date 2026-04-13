<template>
    <div @click="toggleTheme" :dir="dir"
        class="cursor-pointer h-10 p-1 border-outline-variant border-2 -outline-offset-1 flex items-center rounded-xl overflow-hidden relative transition-all duration-300">
        
        <TransitionGroup name="switch" tag="div" class="flex items-center h-full w-full">
            <div v-for="item in layoutItems" :key="item" class="flex transition-all duration-500 ease-in-out items-center h-full">
                
                <div v-if="item === 'icon'"
                    class="h-full rounded-lg bg-surface-variant aspect-square flex items-center justify-center">
                    <BIcon class="w-5 h-5 fill-primary" :icon="themeIcon" />
                </div>
                
                <div v-else class="select-none px-3 text-label-sm text-on-surface whitespace-nowrap">
                    {{ themeTitle }}
                </div>
            </div>
        </TransitionGroup>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useTheme, useI18n, useLocale } from '#imports';

const { t } = useI18n();
const { colorMode, toggleTheme } = useTheme();
const { dir } = useLocale(); 

const isMounted = ref(false);
onMounted(() => {
    isMounted.value = true;
});

const themeIcon = computed(() => colorMode.value === 'light' ? 'PhMoon' : 'PhSunDim');
const themeTitle = computed(() => colorMode.value === 'light' ? t('general.themes.light') : t('general.themes.dark'));

const layoutItems = computed(() => {
    if (!isMounted.value) {
        return ['text', 'icon'];
    }
    return colorMode.value === 'dark' ? ['icon', 'text'] : ['text', 'icon'];
});
</script>

<style scoped>
.switch-move {
    transition: all 0.5s ease;
}
</style>