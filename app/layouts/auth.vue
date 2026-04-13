<template>
    <div class=" w-dvw md:flex-row flex-col-reverse bg-surface h-dvh flex">
        <div class="flex flex-col items-center gap-y-16 shrink-0 md:basis-1/2">
            <div class=" hidden md:flex pt-6 shrink-0 items-center gap-x-3">
                <ThemeSwitch />
                <LocaleSwitch />

            </div>
            <div class="w-full flex-1 flex justify-center items-center">
                <div ref="cardRef"
                    class="lg:shadow-floating bg-surface rounded-3xl w-99 overflow-hidden transition-[height] duration-300 ease-in-out"
                    :style="{ height: cardHeight }">
                    <div ref="contentRef" class="p-6 ">
                        <AuthHeader v-if="routeDetails.routesWithHeader.includes(route.path)"
                            :title="routeDetails.title" :description="routeDetails.description" />
                        <NuxtPage />
                    </div>
                </div>
            </div>
        </div>
        <div class=" md:flex-auto flex-1 md:basis-1/2">
            <BImage :src="backgroundImage" fit="cover"
                class=" min-w-full min-h-full max-w-full max-h-full h-full w-full">
                <div class=" w-full h-full flex justify-center items-center">
                    <AuthSlider />
                </div>
            </BImage>
        </div>
    </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from '#imports';
import backgroundImage from '/images/auth/auth-bg.webp';
import AuthHeader from '@/components/auth/FormHeader.vue';
import ThemeSwitch from '~/components/general/ThemeSwitch.vue';
import LocaleSwitch from '~/components/general/LocaleSwitch.vue';
import AuthSlider from '~/components/auth/AuthSlider.vue';
const authStore = useAuthStore()
const { dir } = useLocale()
const { t } = useI18n();
const route = useRoute();
const routeDetails = computed(() => ({
    routesWithHeader: ['/auth', '/auth/password', '/auth/verify', '/auth/register'],
    title: route.path === '/auth/verify' && !authStore.isRegistering ? t('auth.login.title') : t('auth.register.title'),
    description: route.path === '/auth' ? t('auth.login.enterDetails') : (formatPhoneNumber(authStore.loginIdentifier ? authStore.loginIdentifier : ''))
}));

const cardRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);
const cardHeight = ref('auto');
let observer: ResizeObserver | null = null;

onMounted(() => {
    if (process.client && contentRef.value) {
        observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                // We add the pixel value to trigger the CSS transition
                const height = entry.contentRect.height;
                cardHeight.value = `${height + 48}px`;
            }
        });

        observer.observe(contentRef.value);
    }
});

onUnmounted(() => {
    if (observer) observer.disconnect();
});
</script>
<style scoped>
.v-enter-active,
.v-leave-active {
    transition: opacity 0.2s ease;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
}
</style>