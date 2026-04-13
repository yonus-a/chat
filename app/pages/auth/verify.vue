<template>
    <div class="w-full flex flex-col pt-4 gap-y-6">
        <div class="text-center select-none text-on-surface text-label-sm">
            {{ t('auth.code.enterCode') }}
        </div>

        <BPin v-model="pinCode.value" :color="pinCode.color" :message="pinCode.message" />

        <div class="w-full flex flex-col items-center gap-y-2">
            <div class="h-5 text-center select-none">
                <div dir="ltr" v-show="remainingSeconds > 0" class="text-body-md text-on-surface">
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

const { t } = useI18n();
const authStore = useAuthStore();
const hasErrors = ref(false);
const router = useRouter()
const isVerifying = ref(false);
const remainingSeconds = ref(0);
let timerInterval: any = null;

const pinCode = ref({
    value: '',
    color: 'primary',
    message: ''
});

const isSubmitDisabled = computed(() => pinCode.value.value.length < 6)

// Identifier check to prevent errors if user navigates directly here
const currentPhone = computed(() => authStore.loginIdentifier || '');

const syncTimer = () => {
    if (currentPhone.value) {
        remainingSeconds.value = authStore.getRemainingTime(currentPhone.value);
    }
};

const handleResend = () => {
    if (remainingSeconds.value > 0 || authStore.isRequesting) return;
    authStore.requestOtp();
};

const validateAndSend = async () => {
    if (pinCode.value.value.length < 6 || isVerifying.value) return;

    isVerifying.value = true;
    try {
        console.log("Verifying OTP for:", currentPhone.value);
        // API verification logic here

        // if successful proceed to this block
        if (authStore.isRegistering) {
            router.push('/auth/register')
        } else {
            router.push('/dashboard')
        }
    } finally {
        isVerifying.value = false;
    }
};

onMounted(() => {
    syncTimer();
    timerInterval = setInterval(syncTimer, 1000);
});

onUnmounted(() => {
    if (timerInterval) clearInterval(timerInterval);
});

watch(() => pinCode.value.value, (val) => {
    pinCode.value.message = '';
    pinCode.value.color = 'primary';
    if (val.length === 6) validateAndSend();
});

const isRequesting = computed(() => authStore.isRequesting);
const buttonTitle = computed(() => authStore.isRegistering ? t('auth.register.title') : t('auth.login.title'));
const resendButtonClasses = computed(() => {
    if (isRequesting.value) return 'opacity-0';
    return remainingSeconds.value > 0 ? 'text-on-surface/50 cursor-not-allowed' : 'text-primary cursor-pointer';
});
</script>