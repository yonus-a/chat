<template>
  <div class="w-full">
    <BInput @submit="validateFields" type="password" :title="t('auth.password.title')"
      :placeholder="t('auth.password.passwordPlaceholder')" v-model="password.value" :color="password.color"
      :message="password.message" />

    <BCheckBox v-model="rememberMe" :label="t('auth.password.rememberMe')" />

    <div class="w-full flex mt-4 flex-col gap-y-3">
      <BButton @click="validateFields" class="w-full" :text="t('auth.login.title')" :loading="isSending"
        :disabled="hasErrors" />

      <BButton color="secondary" class="min-w-full" :text="t('auth.password.loginViaCode')" @click="loginByOtp" />

      <NuxtLinkLocale to="/auth" class="w-full">
        <BButton type="ghost" class="min-w-full" :text="t('auth.password.changeNumber')" />
      </NuxtLinkLocale>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n, useValidation, useAuthStore } from '#imports';

// Composables
const router = useRouter()
const { t } = useI18n();
const { validatePassword } = useValidation();
const authStore = useAuthStore();
const localePath = useLocalePath()

useSeoMeta({
  title: () => t('seo.auth.password.title'),
  description: () => t('seo.auth.password.description'),
  ogTitle: () => `${t('seo.siteName')} - ${t('seo.auth.password.title')}`,
});


// State
const isSending = ref(false);
const hasErrors = ref(false);
const rememberMe = ref(false);

const password = ref({
  value: '',
  color: 'primary',
  message: ''
});

/**
 * Validation Logic
 * Runs the check against the input and updates the UI state.
 */
const validateFields = () => {
  // Reset state
  password.value.message = '';
  password.value.color = 'primary';
  hasErrors.value = false;

  // Execute the validation from your utils/composable
  const error = validatePassword(password.value.value);

  if (error) {
    password.value.message = error;
    password.value.color = 'error';
    hasErrors.value = true;
    return; // Stop here if validation fails
  }

  // If we reach here, validation passed
  submitPassword();
};

/**
 * Final Submission
 * Interacts with the backend via the Auth Store.
 */
const submitPassword = async () => {
  if (isSending.value || hasErrors.value) return;

  isSending.value = true;
  try {
    // Logic to verify password using the identifier stored in authStore

    // Example: const success = await authStore.loginWithPassword(password.value.value);
    // if (success) router.push(localePath('/dashboard'));

  } catch (error) {
    password.value.message = t('auth.password.incorrect');
    password.value.color = 'error';
  } finally {
    isSending.value = false;
  }
};

const loginByOtp = async () => {
  if (authStore.isRequesting) return
  authStore.requestOtp()
  router.push(localePath('/auth/verify'))
}

// Clear error state when the user starts typing again
watch(() => password.value.value, () => {
  password.value.color = 'primary';
  password.value.message = '';
  hasErrors.value = false;
});
</script>