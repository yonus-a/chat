<template>
    <div class="relative w-full h-full overflow-hidden" :dir="isRtl ? 'rtl' : 'ltr'">
        <div class="w-full h-full overflow-hidden">
            <div :class="['w-full flex flex-row-reverse max-h-full h-full', sliderClass]">

                <div class="h-full flex items-center justify-center min-w-full relative pointer-events-none">
                    <BImage class=" max-w-160 w-full aspect-square max-h-160" auto-size no-loading :src="firstImage">
                        <div
                            class="w-full p-5 justify-end hidden md:flex items-end h-full relative pointer-events-auto">
                            <div
                                class="max-w-70 w-full px-6 py-4 flex flex-col gap-y-2 absolute rounded-3xl bg-white/20 glass-effect bottom-0 rtl:left-0 ltr:right-0">
                                <div class="text-black select-none text-title-lg">{{ t('auth.slides.title') }}</div>
                                <div class="w-full leading-6 text-justify text-black text-label-md select-none">
                                    {{ firstText }}
                                </div>
                            </div>
                        </div>
                    </BImage>
                </div>

                <div class="h-full flex items-center justify-center min-w-full relative pointer-events-none">
                    <BImage class=" max-w-160 w-full aspect-square max-h-160" auto-size no-loading :src="secondImage">
                        <div
                            class="w-full p-5 justify-end hidden md:flex items-end h-full relative pointer-events-auto">
                            <div
                                class="max-w-70 w-full px-6 py-4 flex flex-col gap-y-2 absolute rounded-3xl bg-white/20  glass-effect bottom-0 rtl:left-0 ltr:right-0">
                                <div class="text-black select-none text-title-lg">{{ t('auth.slides.title') }}</div>
                                <div class="w-full leading-6 text-justify text-black text-label-md select-none">
                                    {{ secondText }}
                                </div>
                            </div>
                        </div>
                    </BImage>
                </div>
            </div>
        </div>

        <!-- 
        <div class="absolute top-4 left-4 z-50 bg-white p-4 rounded-xl shadow-xl flex flex-col gap-3">
            <p class="text-xs font-bold text-gray-700">Auth Flow Tester</p>

            <div class="flex flex-col gap-1">
                <span class="text-[10px] font-bold text-blue-600">Old User (3 Steps):</span>
                <div class="flex gap-1">
                    <button @click="testNavigation(false, '/auth')"
                        class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-[10px] rounded transition-all">1.
                        Login</button>
                    <button @click="testNavigation(false, '/auth/password')"
                        class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-[10px] rounded transition-all">2.
                        Password</button>
                    <button @click="testNavigation(false, '/auth/verify')"
                        class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-[10px] rounded transition-all">3.
                        Verify</button>
                </div>
            </div>

            <div class="flex flex-col gap-1">
                <span class="text-[10px] font-bold text-green-600">New User (5 Steps):</span>
                <div class="flex gap-1">
                    <button @click="testNavigation(true, '/auth')"
                        class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-[10px] rounded transition-all">1.
                        Login</button>
                    <button @click="testNavigation(true, '/auth/verify')"
                        class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-[10px] rounded transition-all">2.
                        Verify</button>
                    <button @click="testNavigation(true, '/auth/identity')"
                        class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-[10px] rounded transition-all">3.
                        Identity</button>
                    <button @click="testNavigation(true, '/auth/register')"
                        class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-[10px] rounded transition-all">4.
                        Register</button>
                    <button @click="testNavigation(true, '/auth/profile')"
                        class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-[10px] rounded transition-all">5.
                        Profile</button>
                </div>
            </div>
        </div>
 -->
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '~/stores/authStore';
import BImage from '~/components/global/BImage.vue';
import loginImage from '/images/auth/login.webp';
import verifyImage from '/images/auth/verify.webp';
import profileImage from '/images/auth/profile.webp';

export default defineComponent({
    name: 'AuthSlider',
    components: { BImage },
    setup() {
        const route = useRoute();
        const router = useRouter();
        const authStore = useAuthStore();
        const { t, locale } = useI18n();

        const isRtl = computed(() => locale.value === 'fa');
        const selectedTexts = ref<string[]>([]);

        const slideTime = ref(300);
        const sliderClass = ref('slide-stop');

        const firstImage = ref('');
        const secondImage = ref('');
        const firstText = ref('');
        const secondText = ref('');

        const slideTimeout = ref<any>(null);
        const flashTimeout = ref<any>(null);

        const flowOld = ['/auth', '/auth/password', '/auth/verify'];
        const flowNew = ['/auth', '/auth/verify', '/auth/identity', '/auth/register', '/auth/profile'];
        const currentFlow = computed(() => authStore.isRegistering ? flowNew : flowOld);

        const getImageForPath = (path: string) => {
            if (path === '/auth' || path.includes('/password')) return loginImage;
            // Identity uses verifyImage (similar to verify/register phase)
            if (path.includes('/verify') || path.includes('/register') || path.includes('/identity')) return verifyImage;
            if (path.includes('/profile')) return profileImage;
            return loginImage;
        };

        onMounted(() => {
            const allKeys = ['slide1', 'slide2', 'slide3', 'slide4', 'slide5', 'slide6'];
            const shuffled = [...allKeys].sort(() => 0.5 - Math.random());
            selectedTexts.value = shuffled.slice(0, 4).map(key => t(`auth.slides.${key}`));

            const initialIdx = Math.max(0, currentFlow.value.indexOf(route.path));
            firstImage.value = getImageForPath(route.path);
            firstText.value = selectedTexts.value[initialIdx % 4];

            secondImage.value = firstImage.value;
            secondText.value = firstText.value;
        });

        watch(() => route.path, async (newPath, oldPath) => {
            const flow = currentFlow.value;
            const newIdx = flow.indexOf(newPath);
            const oldIdx = flow.indexOf(oldPath);

            if (newIdx === -1 || oldIdx === -1) return;

            const total = flow.length;
            let isNext = true;

            if ((newIdx > oldIdx && !(newIdx === total - 1 && oldIdx === 0)) || (newIdx === 0 && oldIdx === total - 1)) {
                isNext = true;
            } else {
                isNext = false;
            }

            const incomingImage = getImageForPath(newPath);
            const incomingText = selectedTexts.value[newIdx % 4];

            if (slideTimeout.value) clearTimeout(slideTimeout.value);
            if (flashTimeout.value) clearTimeout(flashTimeout.value);

            if (isNext) {
                // Forward Slide Setup - Exact same logic as reverse
                secondImage.value = firstImage.value;
                secondText.value = firstText.value;

                await nextTick();
                sliderClass.value = 'slider';

                // Defer updating the hidden slide so the user doesn't see a flash before the CSS animation starts
                flashTimeout.value = setTimeout(() => {
                    secondImage.value = incomingImage;
                    secondText.value = incomingText;
                }, 50);

                slideTimeout.value = setTimeout(() => {
                    firstImage.value = incomingImage;
                    firstText.value = incomingText;
                    sliderClass.value = 'slide-stop';
                }, slideTime.value);

            } else {
                // Reverse Slide Setup
                secondImage.value = firstImage.value;
                secondText.value = firstText.value;

                await nextTick();
                sliderClass.value = 'slider-reverse';

                // Defer updating the hidden slide so the user doesn't see a flash before the CSS animation starts
                flashTimeout.value = setTimeout(() => {
                    firstImage.value = incomingImage;
                    firstText.value = incomingText;
                }, 50);

                slideTimeout.value = setTimeout(() => {
                    firstImage.value = incomingImage;
                    firstText.value = incomingText;
                    sliderClass.value = 'slide-stop';
                }, slideTime.value);
            }
        });

        const testNavigation = (isNewUser: boolean, path: string) => {
            authStore.isRegistering = isNewUser;
            router.push(path);
        };

        return {
            t,
            isRtl,
            sliderClass,
            firstImage,
            secondImage,
            firstText,
            secondText,
            testNavigation
        };
    }
});
</script>

<style scoped>
/* LTR Standard Animations */
.slider {
    animation-name: slide;
    animation-duration: 0.3s;
    animation-fill-mode: backwards;
}

.slider-reverse {
    animation-name: slide-reverse;
    animation-duration: 0.3s;
    animation-fill-mode: backwards;
    flex-direction: row-reverse;
}

/* RTL Override for Animations */
[dir="rtl"] .slider {
    animation-name: slide-rtl;
}

[dir="rtl"] .slider-reverse {
    animation-name: slide-reverse-rtl;
}

/* Horizontal Animations LTR */
@keyframes slide {
    0% {
        transform: translateX(0%);
    }

    100% {
        transform: translateX(100%);
    }
}

@keyframes slide-reverse {
    0% {
        transform: translateX(100%);
    }

    100% {
        transform: translateX(0%);
    }
}

/* Horizontal Animations RTL */
@keyframes slide-rtl {
    0% {
        transform: translateX(0%);
    }

    100% {
        transform: translateX(-100%);
    }
}

@keyframes slide-reverse-rtl {
    0% {
        transform: translateX(-100%);
    }

    100% {
        transform: translateX(0%);
    }
}

.slide-stop {
    transform: translateX(0%);
}
</style>