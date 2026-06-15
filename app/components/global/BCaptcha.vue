<template>
    <div class="relative w-full">
        <div :class="[error ? 'border-error' : 'border-surface-variant']"
            class="w-full transition-all duration-200 ease-in-out bg-surface-variant border rounded-xl p-2 flex items-center gap-x-3  overflow-hidden">

            <div class="relative w-15 h-15 flex justify-center items-center shrink-0">

                <div class="absolute inset-0 flex justify-center items-center transition-opacity duration-500"
                    :class="verified ? 'opacity-100' : 'opacity-0'">
                    <div
                        class="absolute rounded-full opacity-10 w-9 h-9 bg-gradient-primary-secondary animate-ripple-1">
                    </div>
                    <div
                        class="absolute rounded-full opacity-10 w-9 h-9 bg-gradient-primary-secondary animate-ripple-2">
                    </div>
                    <div
                        class="absolute rounded-full opacity-10 w-9 h-9 bg-gradient-primary-secondary animate-ripple-3">
                    </div>
                </div>

                <div class=" w-9 h-9 relative">
                    <div @click="handleTrigger"
                        class="relative z-30 w-9 h-9 border-2 flex justify-center items-center rounded-full overflow-hidden transition-all duration-300 ease-in-out"
                        :class="[verified ? 'border-transparent' : 'border-outline bg-surface', !verified && !loading ? 'cursor-pointer ' : 'cursor-default', loading ? 'opacity-0 pointer-events-none' : 'pointer-events-auto opacity-100']">

                        <div class="absolute inset-0 bg-gradient-primary-secondary transition-transform duration-500 ease-out origin-center rounded-full"
                            :class="verified ? 'scale-100' : 'scale-0'"></div>



                        <BIcon icon="PhCheck" weight="bold"
                            class="absolute z-10 w-5 h-5 fill-white transition-all duration-500 ease-out delay-100"
                            :class="verified ? 'opacity-100 scale-100' : 'opacity-0 scale-50'" />
                    </div>
                    <BIcon icon="PhCircleNotch" weight="bold"
                        class="absolute w-9 h-9 fill-primary transition-all duration-300 top-0 left-0 animate-spin"
                        :class="loading ? 'opacity-100 scale-100' : 'opacity-0 scale-50'" />
                </div>
            </div>

            <div class="">
                <div class="select-none text-body-sm text-on-surface">{{ loading ?
                    t('auth.login.capchaLoading') :
                    t('auth.login.notRobot') }}</div>
                <div class=" transition-all text-body-sm text-error select-none overflow-hidden duration-200 ease-in-out"
                    :class="[error ? ' opacity-100 h-auto' : 'h-0 opacity-0']">{{ errorText === '' ?
                        t('auth.login.problemOccured') : t('validation.captcha_required') }}
                </div>
            </div>
        </div>

        <div class="opacity-0 pointer-events-none h-0 overflow-hidden">
            <altcha-widget ref="altcha" auto="off" :challenge="challengeUrl" floating hidefooter hidelogo
                @statechange="onStateChange"></altcha-widget>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from '#imports';
const config = useRuntimeConfig();
const emit = defineEmits(['verified', 'error']);
const { t } = useI18n();
const challengeUrl = config.public.altchaChallengeUrl
const altcha = ref<any>(null);
const loading = ref(false);
const verified = ref(false);
const error = ref(false);
const errorText = ref('');
const timeoutRef = ref<ReturnType<typeof setTimeout> | null>(null);
const handleTrigger = () => {
    if (verified.value || loading.value) return;
    errorText.value = ''

    error.value = false;
    loading.value = true;

    if (timeoutRef.value) clearTimeout(timeoutRef.value);

    timeoutRef.value = setTimeout(() => {
        if (loading.value && !verified.value) {
            console.error('[Captcha] Manual timeout reached. Forcing error state.');
            loading.value = false;
            error.value = true;
        }
    }, 10000);

    // 3. Trigger the widget
    if (altcha.value) {
        altcha.value.verify();
    } else {
        clearTimeout(timeoutRef.value);
        loading.value = false;
        error.value = true;
    }
};

const onStateChange = (ev: any) => {
    const { state, payload } = ev.detail;

    if (state === 'verified') {
        // SUCCESS: Kill the timeout and proceed
        if (timeoutRef.value) clearTimeout(timeoutRef.value);
        loading.value = false;
        verified.value = true;
        error.value = false;
        emit('verified', payload);
    } else if (state === 'error' || state === 'expired') {
        // ERROR: Kill the timeout and show error
        if (timeoutRef.value) clearTimeout(timeoutRef.value);
        loading.value = false;
        verified.value = false;
        error.value = true;
        emit('error');
    }
};

const setError = (state: boolean = true, text: string) => {
    error.value = state;
    errorText.value = text;
};

defineExpose({
    setError
});

</script>
<style scoped>
@keyframes captcha-ripple {
    0% {
        transform: scale(0.9);
        opacity: 0.6;
        /* Higher starting opacity so all three are clearly visible */
    }

    100% {
        transform: scale(2);
        /* Larger scale to ensure overlap through the whole 3s cycle */
        opacity: 0;
    }
}

/* Base animation: 3s total duration to give the 3 waves space to breathe */
.animate-ripple-1,
.animate-ripple-2,
.animate-ripple-3 {
    animation: captcha-ripple 3s linear infinite;
}

/* Staggered offsets: 3s duration / 3 circles = 1s intervals */
.animate-ripple-1 {
    animation-delay: 0s;
    /* Reaches 100% at T=3s */
}

.animate-ripple-2 {
    animation-delay: -1s;
    /* Reaches 100% at T=2s (is at 33% at start) */
}

.animate-ripple-3 {
    animation-delay: -2s;
    /* Reaches 100% at T=1s (is at 66% at start) */
}
</style>