<template>
  <div class="w-full flex flex-col">
    <BInput 
      type="text" 
      inputmode="numeric"
      :maxlength="11" 
      :title="t('auth.login.username')" 
      :placeholder="t('auth.login.usernamePlaceholder')"
      v-model="userName.value" 
      :color="userName.color" 
      :message="userName.message" 
    />

    <div class="flex flex-col gap-y-4 w-full">
      <BCaptcha 
        ref="captchaRef" 
        @verified="handleCaptchaVerified" 
        @error="isVerified = false" 
      />

      <div class="w-full flex flex-col gap-y-3">
        <BButton 
          @click="validateFields" 
          class="w-full" 
          :loading="isSending" 
          :disabled="hasErrors"
          :text="t('auth.login.title')" 
        />

        <div class="flex w-full items-center gap-x-2">
          <div class="flex-1 border border-outline"></div>
          <div class="text-body-sm opacity-30 text-on-surface select-none shrink-0">
            {{ t('auth.register.or') }}
          </div>
          <div class="flex-1 border border-outline"></div>
        </div>

        <OAuthButton 
          v-for="btn in oauthProviders" 
          :key="btn.provider" 
          :src="btn.logo" 
          :text="btn.label"
          :provider="btn.provider" 
          @click="handleOAuthAction" 
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useValidation, useI18n, useRouter } from '#imports';
import googleLogo from '/images/auth/google.svg';
import dolateManLogo from '/images/auth/dolate-man.svg';
import OAuthButton from '@/components/auth/OAuthButton.vue'

// Composables
const router = useRouter();
const { t } = useI18n();
const { validateAuthIdentifier } = useValidation();

// State
const hasErrors = ref(false);
const isSending = ref(false);
const isVerified = ref(false);
const captchaPayload = ref(null);
const captchaRef = ref<any>(null);

const userName = ref({
  color: 'primary',
  value: '',
  message: ''
});

// OAuth Configuration
const oauthProviders = [
  { provider: 'google', label: t('auth.login.googleLogin'), logo: googleLogo },
  { provider: 'dolat', label: t('auth.login.dolatLogin'), logo: dolateManLogo }
];

// Logic
const validateFields = () => {
  userName.value.message = '';
  userName.value.color = 'primary';
  hasErrors.value = false;

  // Validation
  const error = validateAuthIdentifier(userName.value.value);

  if (error) {
    userName.value.message = error;
    userName.value.color = 'error';
    hasErrors.value = true;
  }

  // Captcha Check
  if (!isVerified.value) {
    hasErrors.value = true;
    if (captchaRef.value) {
      captchaRef.value.setError(true);
    }
  }

  if (!hasErrors.value) {
    submitField();
  }
};

const submitField = async () => {
  if (isSending.value || hasErrors.value) return;
  isSending.value = true;

  try {
    // API call logic will go here
    router.push('/auth/password');
  } catch (error) {
    console.error('Login failed:', error);
  } finally {
    isSending.value = false;
  }
};

const handleCaptchaVerified = (payload: any) => {
  isVerified.value = true;
  captchaPayload.value = payload;
};

const handleOAuthAction = (provider: string) => {
  console.log(`Initiating login for: ${provider}`);
  switch (provider) {
    case 'google':
      // logic
      break;
    case 'dolat':
      // logic
      break;
    default:
      console.warn('Unknown provider');
  }
};

// Watchers
watch(() => userName.value.value, () => {
  userName.value.color = 'primary';
  userName.value.message = '';
  hasErrors.value = false;
});

watch(isVerified, (newVal) => {
  if (newVal) hasErrors.value = false;
});
</script>