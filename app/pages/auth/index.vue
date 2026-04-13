<template>
  <div class="w-full flex flex-col">
    <BInput @submit="validateFields" type="text" inputmode="numeric" :maxlength="11" :title="t('auth.login.username')"
      :placeholder="t('auth.login.usernamePlaceholder')" v-model="userName.value" :color="userName.color"
      :message="userName.message" />

    <div class="flex flex-col gap-y-4 w-full">
      <BCaptcha ref="captchaRef" @verified="handleCaptchaVerified" @error="isVerified = false" />

      <div class="w-full flex flex-col gap-y-3">
        <BButton @click="validateFields" class="w-full" :loading="isSending" :disabled="hasErrors"
          :text="t('auth.login.title')" />

        <div class="flex w-full items-center gap-x-2">
          <div class="flex-1 border border-outline"></div>
          <div class="text-body-sm opacity-30 text-on-surface select-none shrink-0">
            {{ t('auth.register.or') }}
          </div>
          <div class="flex-1 border border-outline"></div>
        </div>

        <OAuthButton v-for="btn in oauthProviders" :key="btn.provider" :src="btn.logo" :text="btn.label"
          :provider="btn.provider" @click="handleOAuthAction" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import googleLogo from '/images/auth/google.svg';
import dolateManLogo from '/images/auth/dolate-man.svg';
import OAuthButton from '@/components/auth/OAuthButton.vue';

const authStore = useAuthStore();
const router = useRouter();
const { t } = useI18n();
const { validatePhoneNumber } = useValidation();

const hasErrors = ref(false);
const isSending = ref(false);
const isVerified = ref(false);
const captchaRef = ref<any>(null);

const userName = ref({
  color: 'primary',
  value: authStore.loginIdentifier || '',
  message: ''
});

onMounted(() => {
  authStore.resetLoginData();

  userName.value.value = '';
});

const oauthProviders = [
  { provider: 'google', label: t('auth.login.googleLogin'), logo: googleLogo },
  { provider: 'dolat', label: t('auth.login.dolatLogin'), logo: dolateManLogo }
];

const validateFields = () => {
  userName.value.message = '';
  userName.value.color = 'primary';
  hasErrors.value = false;

  const error = validatePhoneNumber(userName.value.value);
  if (error) {
    userName.value.message = error;
    userName.value.color = 'error';
    hasErrors.value = true;
  }

  if (!isVerified.value) {
    hasErrors.value = true;
    if (captchaRef.value) captchaRef.value.setError(true);
  }

  if (!hasErrors.value) submitField();
};

const submitField = async () => {
  if (isSending.value || hasErrors.value) return;
  isSending.value = true;

  try {
    const phone = userName.value.value;

    // Simulate user check (Mock logic)
    // isNewUser = true -> New User Flow (/auth/verify)
    // isNewUser = false -> Existing User Flow (/auth/password)
    const isNewUser = true;

    authStore.setLoginData(phone, isNewUser);
    const remainingTime = authStore.getRemainingTime(phone);
    // If sent less than 60s ago (Remaining > 60 in a 120s window), go straight to target
    if (remainingTime > 60) {
      if (isNewUser) {
        await authStore.requestOtp()
      }
      return isNewUser ? router.push('/auth/verify') : router.push('/auth/password');
    }

    const success = await authStore.requestOtp();
    if (success) {
      if (isNewUser) {
        router.push('/auth/verify');
      } else {
        router.push('/auth/password');
      }
    }
  } catch (error) {
    console.error('Login failed:', error);
  } finally {
    isSending.value = false;
  }
};

const handleCaptchaVerified = () => {
  isVerified.value = true;
};

const handleOAuthAction = (provider: string) => {
  console.log(`OAuth: ${provider}`);
};

watch(() => userName.value.value, () => {
  userName.value.color = 'primary';
  userName.value.message = '';
  hasErrors.value = false;
});

watch(isVerified, (newVal) => {
  if (newVal) hasErrors.value = false;
});
</script>