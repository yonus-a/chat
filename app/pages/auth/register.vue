<template>
  <div class="w-full">
    <BInput 
      v-model="email.value" 
      :color="email.color" 
      :message="email.message" 
      :title="t('auth.register.email')"
      :placeholder="t('auth.register.emailPlaceholder')" 
    />

    <BInput 
      type="password" 
      autocomplete="new-password" 
      :title="t('auth.password.title')" 
      newPassword
      :placeholder="t('auth.password.passwordPlaceholder')" 
      v-model="password.value" 
      :color="password.color"
      :message="password.message" 
    />

    <BInput 
      type="password" 
      autocomplete="new-password" 
      :title="t('auth.password.repeatPassword')"
      :placeholder="t('auth.password.repeatPasswordPlaceholder')" 
      v-model="passwordRepeat.value"
      :color="passwordRepeat.color" 
      :message="passwordRepeat.message" 
    />

    <BCheckBox v-model="agreeToTerms">
      <i18n-t keypath="auth.register.termsOfService" tag="span" class="text-body-md text-on-surface">
        <template #link>
          <span class="text-primary font-bold cursor-pointer hover:underline decoration-primary/30">
            <RouterLink to="/terms-of-service">
              {{ t('auth.register.termsLink') }}
            </RouterLink>
          </span>
        </template>
      </i18n-t>
    </BCheckBox>

    <div class="w-full flex flex-col gap-y-3">
      <BButton 
        @click="validateFields" 
        class="mt-4 min-w-full" 
        :text="t('auth.register.continue')" 
        :loading="isSending"
        :disabled="hasErrors"
      />
      <RouterLink to="/auth" class="w-full">
        <BButton class="min-w-full" type="ghost" :text="t('auth.register.back')" />
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n, useValidation } from '#imports';

// State
const { t } = useI18n();
const { validatePassword, validateEmail } = useValidation();

const isSending = ref(false);
const hasErrors = ref(false);
const agreeToTerms = ref(false);

const email = ref({ value: '', color: 'primary', message: '' });
const password = ref({ value: '', color: 'primary', message: '' });
const passwordRepeat = ref({ value: '', color: 'primary', message: '' });

// Kept for consistency, though not used in template provided
const birthDay = ref({ value: '', color: 'primary', message: '' });
const birthMonth = ref({ value: '', color: 'primary', message: '' });
const birthYear = ref({ value: '', color: 'primary', message: '' });

/**
 * Field-specific state resetter
 */
const resetFieldState = (field: any) => {
  field.color = 'primary';
  field.message = '';
  hasErrors.value = false;
};

/**
 * Validation Logic
 */
const validateFields = () => {
  if (isSending.value) return;

  // 1. Validate Email (Optional but must be valid if entered)
  if (email.value.value.trim().length > 0) {
    const emailError = validateEmail(email.value.value, t('auth.register.email'));
    if (emailError) {
      email.value.message = emailError;
      email.value.color = 'error';
      hasErrors.value = true;
    }
  }

  // 2. Validate Password Rules
  const passError = validatePassword(password.value.value);
  if (passError) {
    password.value.message = passError;
    password.value.color = 'error';
    hasErrors.value = true;
  }

  // 3. Validate Password Matching
  if (!hasErrors.value && password.value.value !== passwordRepeat.value.value) {
    passwordRepeat.value.message = t('auth.password.validation.mismatch') || 'Passwords do not match';
    passwordRepeat.value.color = 'error';
    hasErrors.value = true;
  }

  // 4. Terms of Service Check
  if (!agreeToTerms.value) {
    console.log("[Validation] User has not agreed to terms.");
    // Toast logic would go here
    hasErrors.value = true;
  }

  if (!hasErrors.value) {
    sendUserDetails();
  }
};

const sendUserDetails = async () => {
  if (isSending.value || hasErrors.value) return;
  
  isSending.value = true;
  try {
    console.log("[Auth] Sending registration details for:", email.value.value);
    // Add your API call here
  } catch (error) {
    console.error(error);
  } finally {
    isSending.value = false;
  }
};

// --- Watchers to reset errors on change ---

watch(() => email.value.value, () => resetFieldState(email.value));
watch(() => password.value.value, () => resetFieldState(password.value));
watch(() => passwordRepeat.value.value, () => resetFieldState(passwordRepeat.value));
watch(agreeToTerms, () => { hasErrors.value = false; });
</script>