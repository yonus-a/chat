<template>
    <div class=" w-full flex flex-col ">
        <BInput :title="t('auth.login.username')" :placeholder="t('auth.login.usernamePlaceholder')"
            v-model="userName.value" :color="userName.color" :message="userName.message" />
        <div class=" flex flex-col gap-y-4 w-full">
            <BCaptcha challenge-url="https://your-api.com/altcha" @verified="handleCaptchaVerified"
                @error="isVerified = false" />
            <div class=" w-full flex flex-col gap-y-3">
                <BButton class=" w-full" :loading="isSending" :disabled="hasErrors" :text="t('auth.login.title')" />
                <div class=" flex w-full items-center gap-x-2">
                    <div class=" flex-1 border border-outline"></div>
                    <div class=" text-body-sm opacity-30 text-on-surface select-none shrink-0">{{ t('auth.register.or')
                    }}</div>
                    <div class=" flex-1 border border-outline"></div>
                </div>
               
                <div
                    class=" h-11 transition-all  duration-200 ease-in-out hover:bg-surface-variant-3 w-full cursor-pointer select-none text-label-md text-on-surface bg-surface-variant-2 rounded-xl flex items-center justify-between p-3">
                    <div class=" w-5 h-5">
                        <BImage class=" min-w-full min-h-full max-w-full max-h-full w-full h-full"
                            :src="dolateManLogo" />
                    </div>
                    <div>{{ t('auth.login.dolatLogin') }}</div>
                    <div></div>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue';
import { useValidation } from '#imports';
import { useI18n } from '#imports';
import { useRouter } from 'vue-router';
import BButton from '~/components/global/BButton.vue';
import googleLogo from '/images/auth/google.svg'
import dolateManLogo from '/images/auth/dolate-man.svg'
export default defineComponent({
    name: 'AuthPage',
    setup() {
        const router = useRouter()
        const { t } = useI18n()
        const hasErrors = ref(false)
        const isSending = ref(false)
        const rememberMe = ref(false)
        const isVerified = ref(false);
        const captchaPayload = ref(null);

        const userName = ref({
            color: 'primary',
            value: '',
            message: ''
        })

        const validateFields = () => {
            if (isSending.value || hasErrors.value) return

            if (!hasErrors.value) {
                submitField()
            }
        }

        const submitField = async () => {
            if (isSending.value || hasErrors.value) return
            isSending.value = true

            try {

            } catch (error) {

            } finally {
                isSending.value = false;
                router.push('/auth/password')
            }
        }

        const handleCaptchaVerified = (payload: any) => {
            isVerified.value = true;
            captchaPayload.value = payload;
        };


        return {
            handleCaptchaVerified,
            isVerified,
            t, dolateManLogo,
            googleLogo,
            validateFields,
            isSending,
            userName,
            rememberMe,
            hasErrors,
        }
    }
})
</script>