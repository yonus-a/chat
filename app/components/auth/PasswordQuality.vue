<template>
    <div class="relative w-full h-1 mt-2">
        <div class="absolute inset-0 flex gap-x-2">
            <div v-for="n in 6" :key="'bg-' + n" class="flex-1 h-full bg-surface-variant-2 rounded-full"></div>
        </div>

        <div class="absolute inset-0 flex gap-x-2 transition-all duration-700 ease-in-out"
            :style="{ clipPath: `inset(0 ${100 - (passwordSecurityRate(newPassword) / 6) * 100}% 0 0)` }">
            <div v-for="n in 6" :key="'fill-' + n" class="flex-1 h-full rounded-full transition-colors duration-500"
                :class="[securityBgClass]">
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from '#imports';
import { useValidation } from '#imports';
export default defineComponent({
    name: 'PasswordRules',
    props: {
        newPassword: {
            type: String,
            default: ''
        }
    },
    setup(props) {
        const { t } = useI18n()
        const { passwordSecurityRate } = useValidation()

        const securityBgClass = computed(() => {
            const rate = passwordSecurityRate(props.newPassword);
            if (rate <= 2) return 'bg-error';
            if (rate <= 5) return 'bg-warning';
            return 'bg-secondary';
        });

        const rules = computed(() => [
            t("login.passwordRules.eightCharacters"),
            t("login.passwordRules.oneLowercase"),
            t("login.passwordRules.oneUppercase"),
            t("login.passwordRules.oneNumber"),
            t("login.passwordRules.specialCharacter"),
            t("login.passwordRules.noWhiteSpace"),
        ])

        const securityTextColorClass = computed(() => {
            return securityBgClass.value.replace('bg-', 'text-');
        });

        return {
            t,
            securityTextColorClass,
            securityBgClass,
            rules,
            passwordSecurityRate,
        }
    }
})
</script>