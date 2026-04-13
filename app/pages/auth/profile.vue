<template>
    <div class=" w-full md:pt-0 pt-6 md:h-auto h-dvh flex flex-col gap-y-4">
        <MobileNavigation class=" md:hidden" :title="t('auth.profile.finishProfile')" />
        <div class=" w-full flex flex-col gap-y-3">
            <div class=" select-none md:block hidden text-label-sm text-on-surface">{{ t('auth.profile.profileImage') }}
            </div>
            <ImageUpload v-model="avatar" />
        </div>
        <div class=" md:flex-auto flex flex-col flex-1 w-full">
            <div class=" mb-3 select-none text-label-sm text-on-surface">{{ t('auth.profile.personalDetails.title') }}
            </div>
            <div class=" w-full flex items-center gap-x-2">
                <div class=" basis-1/2">
                    <BInput :maxlength="70" :readonly="isLoading" v-model="name.value" :color="name.color"
                        :message="name.message" :title="t('auth.profile.personalDetails.name')"
                        :placeholder="t('auth.profile.write')" />
                </div>
                <div class=" basis-1/2">
                    <BInput :maxlength="70" :readonly="isLoading" v-model="lastName.value" :color="lastName.color"
                        :message="lastName.message" :title="t('auth.profile.personalDetails.lastName')"
                        :placeholder="t('auth.profile.write')" />
                </div>
            </div>


            <div class=" w-full">
                <div class=" mb-1.5 text-label-sm select-none text-on-surface">{{
                    t('auth.profile.personalDetails.birthDate.title') }}</div>
                <div class=" w-full flex items-center gap-x-2">
                    <BInput :maxlength="2" :readonly="isLoading" align="center" type="number" v-model="birthDay.value"
                        :color="birthDay.color" :message="birthDay.message"
                        :placeholder="t('auth.profile.personalDetails.birthDate.day')" />
                    <BInput :maxlength="2" :readonly="isLoading" align="center" type="number" v-model="birthMonth.value"
                        :color="birthMonth.color" :message="birthMonth.message"
                        :placeholder="t('auth.profile.personalDetails.birthDate.month')" />
                    <BInput :maxlength="4" :readonly="isLoading" align="center" type="number" v-model="birthYear.value"
                        :color="birthYear.color" :message="birthYear.message"
                        :placeholder="t('auth.profile.personalDetails.birthDate.year')" />
                </div>
            </div>
            <BSelect :disabled="isLoading" :title="t('auth.profile.personalDetails.gender.title')" class=" min-w-full"
                :placeholder="t('auth.profile.select')" :options="genders" v-model="gender.value" :color="gender.color"
                :message="gender.message" />

            <div class=" flex md:items-start items-end md:flex-auto flex-1 w-full">
                <BButton :loading="isLoading || isSending" class=" min-w-full" :text="t('auth.profile.submit')"
                    @click="validateFields" :disabled="hasErrors" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import ImageUpload from '~/components/general/ImageUpload.vue';
import { useI18n, useValidation, useProfileStore, useDate } from '#imports';
import MobileNavigation from '~/components/auth/MobileNavigation.vue';

const { t, locale } = useI18n();
const { validateName, validateBirthDate, toEnglishNumbers } = useValidation();
const { g2j, j2g } = useDate();
const profileStore = useProfileStore();
const avatar = ref<File | null>(null);
const isSending = ref(false);
const hasErrors = ref(false);
const router = useRouter()

// --- Local Form State ---
const name = ref({ value: '', color: 'primary', message: '' });
const lastName = ref({ value: '', color: 'primary', message: '' });

const gender = ref({ value: '', color: 'primary', message: '' });
const birthDay = ref({ value: '', color: 'primary', message: '' });
const birthMonth = ref({ value: '', color: 'primary', message: '' });
const birthYear = ref({ value: '', color: 'primary', message: '' });

// --- Computed ---
const isLoading = computed(() => profileStore.isLoading);



const genders = computed(() => [
    { value: 'male', label: t('auth.profile.personalDetails.gender.options.male') },
    { value: 'female', label: t('auth.profile.personalDetails.gender.options.female') },
]);



// --- Hydration Logic ---

const syncFieldsWithStore = () => {
    const data = profileStore.userData;
    console.log('fuck')
    if (!data.name && !data.lastName) return; // Wait for real data

    name.value.value = data.name;
    lastName.value.value = data.lastName;
    // nationality.value.value = data.nationality;
    // nationalId.value.value = data.nationalId;
    gender.value.value = data.gender;

    if (data.birthDate) {
        const date = new Date(data.birthDate);
        if (locale.value === 'fa') {
            const [jy, jm, jd] = g2j(date.getFullYear(), date.getMonth() + 1, date.getDate());
            birthYear.value.value = String(jy);
            birthMonth.value.value = String(jm);
            birthDay.value.value = String(jd);
        } else {
            birthYear.value.value = String(date.getFullYear());
            birthMonth.value.value = String(date.getMonth() + 1);
            birthDay.value.value = String(date.getDate());
        }
    }
};

onMounted(async () => {
    // If store is empty, fetch it.
    if (!profileStore.isLoaded) {
        console.log('fuck2 ')
        await profileStore.loadUserProfile();
    } else {
        syncFieldsWithStore();
    }
});

// Watch the store specifically to sync fields when the API returns
watch(() => profileStore.isLoading, () => {
    if (!profileStore.isLoading) {
        syncFieldsWithStore();
    }
}, { deep: true });

// --- Dirty Check ---

const hasChanges = computed(() => {
    const original = profileStore.userData;

    // Check basic strings (trim to avoid whitespace false positives)
    if (avatar.value) return true;
    if (name.value.value !== original.name) return true;
    if (lastName.value.value !== original.lastName) return true;
    // if (nationality.value.value !== original.nationality) return true;
    // if (nationalId.value.value !== original.nationalId) return true;
    if (gender.value.value !== original.gender) return true;

    // Date Comparison
    if (birthDay.value.value && birthMonth.value.value && birthYear.value.value) {
        const y = parseInt(toEnglishNumbers(birthYear.value.value));
        const m = parseInt(toEnglishNumbers(birthMonth.value.value));
        const d = parseInt(toEnglishNumbers(birthDay.value.value));

        let gY, gM, gD;
        if (locale.value === 'fa') {
            [gY, gM, gD] = j2g(y, m, d);
        } else {
            gY = y; gM = m; gD = d;
        }

        if (original.birthDate) {
            const origDate = new Date(original.birthDate);
            if (gY !== origDate.getFullYear() || gM !== (origDate.getMonth() + 1) || gD !== origDate.getDate()) {
                return true;
            }
        } else {
            return true;
        }
    }

    return false;
});

// --- Watchers for Input Correction ---

const resetField = (field: any) => {
    field.color = 'primary';
    field.message = '';
    hasErrors.value = false;
};

// Loop through all refs to assign watchers
const formRefs = [name, lastName, gender, birthDay, birthMonth, birthYear];
formRefs.forEach((fieldRef) => {
    watch(() => fieldRef.value.value, () => {
        resetField(fieldRef.value);
    });
});

// --- Validation & Submit ---

const validateFields = () => {
    if (isSending.value || isLoading.value || hasErrors.value) return;

    // Name Validation
    const nameErr = validateName(name.value.value, t('auth.profile.personalDetails.name'));
    if (nameErr) { name.value.message = nameErr; name.value.color = 'error'; hasErrors.value = true; }

    const lastErr = validateName(lastName.value.value, t('auth.profile.personalDetails.lastName'));
    if (lastErr) { lastName.value.message = lastErr; lastName.value.color = 'error'; hasErrors.value = true; }

    // ID Validation


    // Date Validation
    const dateErrors = validateBirthDate(
        birthYear.value.value,
        birthMonth.value.value,
        birthDay.value.value
    );

    if (dateErrors) {
        hasErrors.value = true;

        // Target the Year field
        if (dateErrors.year) {
            birthYear.value.message = dateErrors.year;
            birthYear.value.color = 'error';
        }

        // Target the Month field
        if (dateErrors.month) {
            birthMonth.value.message = dateErrors.month;
            birthMonth.value.color = 'error';
        }

        // Target the Day field
        if (dateErrors.day) {
            birthDay.value.message = dateErrors.day;
            birthDay.value.color = 'error';
        }
    }

    // Gender Validation
    if (!gender.value.value) {
        gender.value.message = t('validation.required', { field: t('auth.profile.personalDetails.gender.title') });
        gender.value.color = 'error';
        hasErrors.value = true;
    }

    if (!hasErrors.value && hasChanges.value) {
        submitFields();
    }
};

const submitFields = async () => {
    if (isSending.value || hasErrors.value) return
    isSending.value = true;
    try {
        const y = parseInt(toEnglishNumbers(birthYear.value.value));
        const m = parseInt(toEnglishNumbers(birthMonth.value.value));
        const d = parseInt(toEnglishNumbers(birthDay.value.value));

        let finalGDate;
        if (locale.value === 'fa') {
            const [gy, gm, gd] = j2g(y, m, d);
            finalGDate = new Date(gy, gm - 1, gd);
        } else {
            finalGDate = new Date(y, m - 1, d);
        }

        console.log("Submitting Profile Update...", {
            name: name.value.value,
            birthDate: finalGDate.toISOString()
        });

        // Final backend call would go here
    } catch (error) {
        console.error(error);
    } finally {
        isSending.value = false;
    }
};


</script>