<template>
    <div class="w-full flex flex-col pt-4 gap-y-6">
        <div class="text-center select-none text-on-surface text-label-sm">
            {{ t('auth.code.enterCode') }}
        </div>

        <BPin v-model="pinCode.value" :color="pinCode.color" :message="pinCode.message" />

        <div class="w-full flex flex-col items-center gap-y-2">
            <div class="h-5 text-center select-none">
                <div v-show="remainingSeconds > 0" class="text-body-md text-on-surface">
                    {{ formatCountdown(remainingSeconds) }}
                </div>
            </div>

            <div @click="handleResend" class="w-full flex select-none justify-center items-center relative">
                <div class="text-center text-body-md transition-all duration-200 ease-in-out"
                    :class="resendButtonClasses">
                    {{ t('auth.code.sendCodeAgain') }}
                </div>

                <BIcon v-if="isRequesting" icon="PhCircleNotch"
                    class="w-5 h-5 fill-on-surface animate-spin absolute z-10 opacity-50" />
            </div>
        </div>
        <div class=" w-full flex flex-col gap-y-3">
            <BButton @click="validateAndSend" class="w-full" :text="buttonTitle" :loading="isVerifying"
                :disabled="isSubmitDisabled" />

            <RouterLink to="/auth" class="w-full">
                <BButton class="min-w-full" type="ghost" :text="t('auth.password.changeNumber')" />
            </RouterLink>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useI18n, useAuthStore } from '#imports';
import { formatCountdown } from '~/utils/format';
const hasErrors = ref(false)
const { t } = useI18n();
const authStore = useAuthStore();

// UI States
const isVerifying = ref(false);
const remainingSeconds = ref(0);
let timerInterval: any = null;

const pinCode = ref({
    value: '',
    color: 'primary',
    message: ''
});

// Computed Properties
const isRequesting = computed(() => authStore.isRequesting);

const buttonTitle = computed(() =>
    authStore.loginType === 'phone' ? t('auth.login.title') : t('auth.register.title')
);

const isSubmitDisabled = computed(() =>
    pinCode.value.value.length < 6 || hasErrors.value
);

const resendButtonClasses = computed(() => {
    if (isRequesting.value) return 'opacity-0';
    return remainingSeconds.value > 0
        ? 'text-on-surface/50 cursor-not-allowed'
        : 'text-primary cursor-pointer opacity-100';
});

// Methods
const syncTimer = () => {
    remainingSeconds.value = authStore.getRemainingTime(authStore.loginIdentifier);
};

const handleResend = () => {
    if (remainingSeconds.value > 0 || isRequesting.value) return;
    authStore.requestOtp();
};

const validateAndSend = async () => {
    if (isSubmitDisabled.value) return;

    if (pinCode.value.value.trim().length < 6) {
        hasErrors.value = true;
        pinCode.value.color = 'error'
        pinCode.value.message = t('auth.code.errors.codeLength')
        return
    }

    isVerifying.value = true;
    try {

        // if successful redirect to /dashboard route here 


        // const success = await authStore.verifyOtp(authStore.loginIdentifier, pinCode.value.value);
        // if (!success) {
        //     pinCode.value.message = t('auth.code.invalidCode'); // Ensure this exists in your JSON
        //     pinCode.value.color = 'error';
        //}
    } finally {
        isVerifying.value = false;
    }
};

// Lifecycle
onMounted(() => {
    syncTimer();
    timerInterval = setInterval(syncTimer, 1000);
});

onUnmounted(() => {
    if (timerInterval) clearInterval(timerInterval);
});

// Auto-submit when PIN is complete
watch(() => pinCode.value.value, (val) => {
    pinCode.value.message = '';
    pinCode.value.color = 'primary';
    hasErrors.value = false;
    if (val.length === 6) {
        validateAndSend();
    }
});
</script>