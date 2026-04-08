// composables/useNameValidation.ts

// DO NOT IMPORT useI18n HERE. Let Nuxt auto-import it.

export const useNameValidation = () => {
    // This now uses Nuxt's auto-imported version which has the correct context
    const { locale } = useI18n(); 

    // Regex for Persian characters (including spaces)
    const persianRegex = /^[\u0600-\u06FF\s]+$/;
    // Regex for Latin characters (English letters + spaces)
    const latinRegex = /^[a-zA-Z\s]+$/;

    const checkIsPersian = (text: string) => persianRegex.test(text);
    const checkIsLatin = (text: string) => latinRegex.test(text);

    const validateName = (text: string, fieldTitle: string): string | null => {
        if (!text || text.trim().length === 0) {
            return `${fieldTitle} الزامی می‌باشد.`;
        }

        if (locale.value === 'fa') {
            if (!checkIsPersian(text)) {
                return `${fieldTitle} باید به فارسی نوشته شود.`;
            }
        } else {
            if (!checkIsLatin(text)) {
                return `${fieldTitle} must be in English.`;
            }
        }

        if (text.length < 2) {
            return `${fieldTitle} باید حداقل ۲ حرف باشد.`;
        }

        return null;
    };

    return {
        checkIsPersian,
        checkIsLatin,
        validateName
    };
};