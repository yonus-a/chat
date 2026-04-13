<template>
    <div class="w-full flex md:pt-0 pt-6 flex-col h-dvh md:h-auto">
        <MobileNavigation :title="t('auth.identity.title')" class=" md:hidden" />
        <div class="md:block hidden mb-3 select-none text-on-surface text-label-sm">
            {{ t('auth.identity.title') }}
        </div>

        <BSelect :title="t('auth.profile.personalDetails.nationality')" class="min-w-full"
            :placeholder="t('auth.profile.select')" :options="nationalities" v-model="nationality.value"
            :color="nationality.color" :message="nationality.message" />

        <BInput :maxlength="10" v-model="nationalId.value" type="number" :color="nationalId.color"
            :message="nationalId.message" :title="idCodeFieldProps.title" :placeholder="idCodeFieldProps.placeholder" />

        <div :class="[idNotMatched ? 'opacity-100 mb-4 p-3 h-12' : 'mb-0 opacity-0 p-0 h-0']"
            class="whitespace-nowrap text-wrap flex items-center justify-between border border-error rounded-xl transition-all duration-200 ease-in-out w-full overflow-hidden">
            <div class="text-body-sm select-none text-error">
                {{ t('auth.identity.idNotMatched') }}
            </div>
            <RouterLink to="/auth">
                <div class="text-primary cursor-pointer text-body-sm select-none">
                    {{ t('auth.identity.changeNumber') }}
                </div>
            </RouterLink>
        </div>

        <div class=" w-full md:flex-auto flex-1 flex items-end">
            <BButton @click="validateFields" :disabled="hasErrors" :loading="isSending" class="min-w-full w-full"
                :text="t('auth.register.continue')" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n, useValidation, useRouter } from '#imports';
import MobileNavigation from '~/components/auth/MobileNavigation.vue';
// Composables
const router = useRouter();
const { t } = useI18n();
const { checkIsNationalCode, validateForeignCode } = useValidation();

// State
const nationality = ref({ value: 'iranian', color: 'primary', message: '' });
const nationalId = ref({ value: '', color: 'primary', message: '' });
const hasErrors = ref(false);
const isSending = ref(false);
const idNotMatched = ref(false); // Default to false until API check fails

// Constants / Options
const nationalities = computed(() => [
    { value: 'iranian', label: t('auth.profile.personalDetails.nationalities.iranian') },
    { value: 'nonIranian', label: t('auth.profile.personalDetails.nationalities.nonIranian') },
]);

// Dynamic labels based on nationality
const idCodeFieldProps = computed(() => {
    const isIranian = nationality.value.value === 'iranian';
    return {
        title: isIranian ? t('auth.profile.personalDetails.nationalCode') : t('auth.profile.personalDetails.foreignCode'),
        placeholder: isIranian ? t('auth.profile.personalDetails.nationalCodePlaceholder') : t('auth.profile.personalDetails.foreignCodePlaceholder')
    };
});

/**
 * Resets specific field error state
 */
const resetField = (field: any) => {
    field.color = 'primary';
    field.message = '';
    hasErrors.value = false;
};

/**
 * Validation logic
 */
const validateFields = () => {
    if (isSending.value || hasErrors.value) return;

    if (nationality.value.value === 'iranian') {
        if (!checkIsNationalCode(nationalId.value.value)) {
            nationalId.value.message = t('validation.national_id_invalid');
            nationalId.value.color = 'error';
            hasErrors.value = true;
        }
    } else {
        const foreignErr = validateForeignCode(nationalId.value.value);
        if (foreignErr) {
            nationalId.value.message = foreignErr;
            nationalId.value.color = 'error';
            hasErrors.value = true;
        }
    }

    if (!hasErrors.value) {
        submitFields();
    }
};

/**
 * Submit and navigate to register
 */
const submitFields = async () => {
    if (isSending.value || hasErrors.value) return;

    isSending.value = true;
    try {
        // API logic for identity verification would go here
        // If successful:
        router.push('/auth/profile');
    } catch (error) {
        console.error("Identity submission failed", error);
        idNotMatched.value = true;
    } finally {
        isSending.value = false;
    }
};

// Watchers for input correction
watch(() => nationality.value.value, () => resetField(nationality.value));
watch(() => nationalId.value.value, () => resetField(nationalId.value));
</script>