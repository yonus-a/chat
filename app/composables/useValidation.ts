import { useI18n } from "#imports";

export const useValidation = () => {
  const { t, locale } = useI18n();

  // --- Regex Definitions ---
  const persianRegex = /^[\u0600-\u06FF\s0-9]+$/;
  const latinRegex = /^[a-zA-Z\s0-9.,-]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^09\d{9}$/;
  const postalCodeRegex = /^\d{9}$/;

  // Socials / URLs
  const urlRegex =
    /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  const whatsappRegex =
    /^(https?:\/\/)?(www\.)?(wa\.me|whatsapp\.com|api\.whatsapp\.com)\/.+$/;
  const usernameRegex = /^[a-zA-Z0-9_.-]+$/;

  // --- Helper: Convert Persian Numbers to English for Validation ---
  const toEnglishNumbers = (str: string): string => {
    if (!str) return "";
    return str
      .replace(/[\u06F0-\u06F9]/g, (d) => {
        return String(d.charCodeAt(0) - 1776);
      })
      .replace(/[\u0660-\u0669]/g, (d) => {
        return String(d.charCodeAt(0) - 1632);
      });
  };

  // --- Helper Checks ---
  const checkIsPersian = (text: string) => persianRegex.test(text);
  const checkIsLatin = (text: string) => latinRegex.test(text);
  const checkIsEmail = (text: string) => emailRegex.test(text);
  const checkIsPhone = (text: string) => phoneRegex.test(text);

  // --- Validators ---

  const validateName = (text: string, fieldTitle: string): string | null => {
    if (!text || text.trim().length === 0)
      return t("validation.required", { field: fieldTitle });

    if (locale.value === "fa" && !checkIsPersian(text))
      return t("validation.must_be_persian", { field: fieldTitle });
    if (locale.value === "en" && !checkIsLatin(text))
      return t("validation.must_be_english", { field: fieldTitle });

    if (text.length < 2)
      return t("validation.min_length", { field: fieldTitle, min: 2 });
    return null;
  };

  const validateAddress = (text: string, fieldTitle: string): string | null => {
    if (!text || text.trim().length === 0)
      return t("validation.required", { field: fieldTitle });

    if (locale.value === "fa" && !checkIsPersian(text))
      return t("validation.must_be_persian", { field: fieldTitle });
    if (locale.value === "en" && !checkIsLatin(text))
      return t("validation.must_be_english", { field: fieldTitle });

    if (text.length < 10)
      return t("validation.min_length", { field: fieldTitle, min: 10 });
    return null;
  };

  const validatePostalCode = (
    val: string,
    fieldTitle: string,
  ): string | null => {
    if (!val) return t("validation.required", { field: fieldTitle });
    const englishVal = toEnglishNumbers(val);
    if (englishVal.length !== 10)
      return t("addresses.errors.postalCodeLowlength");
    if (englishVal.startsWith("0") || englishVal.startsWith("2"))
      return t("addresses.errors.postalCodeInvalid");
    if (!/^\d+$/.test(englishVal))
      return t("addresses.errors.postalCodeInvalid");
    return null;
  };

  const validatePlate = (val: string, fieldTitle: string): string | null => {
    if (!val) return null;
    const englishVal = toEnglishNumbers(val);
    const num = parseInt(englishVal);
    if (isNaN(num) || num < 0) return t("addresses.errors.plateInvalid");
    return null;
  };

  const validateUnit = (val: string, fieldTitle: string): string | null => {
    if (!val) return null;
    const englishVal = toEnglishNumbers(val);
    const num = parseInt(englishVal);
    if (isNaN(num) || num < 0) return t("addresses.errors.unitInvalid");
    return null;
  };

  const validateEmail = (text: string, fieldTitle: string): string | null => {
    const title = fieldTitle || t("profile.titles.email");
    if (!text || text.trim().length === 0)
      return t("validation.required", { field: title });
    if (!checkIsEmail(text))
      return t("validation.invalid_format", { field: title });
    return null;
  };

  const validateDate = (
    dateValue: string | Date,
    fieldTitle: string,
    mode: "past" | "future",
  ): string | null => {
    if (!dateValue) return t("validation.required", { field: fieldTitle });
    const inputDate = new Date(dateValue);
    const today = new Date();
    inputDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (isNaN(inputDate.getTime()))
      return t("validation.date_invalid", { field: fieldTitle });
    if (mode === "past" && inputDate >= today)
      return t("validation.date_past", { field: fieldTitle });
    if (mode === "future" && inputDate <= today)
      return t("validation.date_future", { field: fieldTitle });
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (!password)
      return t("validation.required", { field: t("login.password") });
    if (password.length < 8) return t("login.passwordErrors.tooShort");
    if (!/[a-z]/.test(password))
      return t("login.passwordErrors.missingLowercase");
    if (!/[A-Z]/.test(password))
      return t("login.passwordErrors.missingUppercase");
    if (!/\d/.test(password)) return t("login.passwordErrors.missingNumber");
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (!specialCharRegex.test(password))
      return t("login.passwordErrors.missingSpecial");
    if (/\s/.test(password)) return t("login.passwordErrors.hasSpaces");
    return null;
  };

  const checkRules = (password: string) => {
    const val = password;
    return [
      { label: t("login.passwordRules.eightCharacters"), met: val.length >= 8 },
      { label: t("login.passwordRules.oneLowercase"), met: /[a-z]/.test(val) },
      { label: t("login.passwordRules.oneUppercase"), met: /[A-Z]/.test(val) },
      { label: t("login.passwordRules.oneNumber"), met: /\d/.test(val) },
      {
        label: t("login.passwordRules.specialCharacter"),
        met: /[!@#$%^&*(),.?":{}|<>]/.test(val),
      },
      {
        label: t("login.passwordRules.noWhiteSpace"),
        met: val.length > 0 && !/\s/.test(val),
      },
    ];
  };

  const passwordSecurityRate = (pass: string) => {
    return checkRules(pass).filter((r) => r.met).length;
  };

  const validateSlug = (text: string, fieldTitle: string): string | null => {
    if (!text || text.trim().length === 0)
      return t("business.fields.errors.required", { field: fieldTitle });
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(text))
      return t("business.fields.errors.onlyLatinNumbers");
    return null;
  };

  // --- NEW URL & Username Validators ---
  const validateUrl = (text: string, fieldTitle: string): string | null => {
    if (!text || text.trim().length === 0)
      return t("validation.required", { field: fieldTitle });
    if (!urlRegex.test(text)) return t("validation.url_invalid");
    return null;
  };

  const validateWhatsappUrl = (
    text: string,
    fieldTitle: string,
  ): string | null => {
    if (!text || text.trim().length === 0)
      return t("validation.required", { field: fieldTitle });
    if (!whatsappRegex.test(text)) return t("validation.whatsapp_invalid");
    return null;
  };

  const validateSocialUsername = (
    text: string,
    fieldTitle: string,
  ): string | null => {
    if (!text || text.trim().length === 0)
      return t("validation.required", { field: fieldTitle });
    if (!usernameRegex.test(text)) return t("validation.username_invalid");
    return null;
  };

  const checkIsNationalCode = (code: string): boolean => {
    const clean = toEnglishNumbers(code);
    if (!/^\d{10}$/.test(clean)) return false;
    if (/^(\d)\1{9}$/.test(clean)) return false; // Block repetitive digits like 1111111111

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(clean.charAt(i)) * (10 - i);
    }

    const remainder = sum % 11;
    const checkDigit = parseInt(clean.charAt(9));

    return remainder < 2
      ? checkDigit === remainder
      : checkDigit === 11 - remainder;
  };

  // --- Strict Phone Number Validation ---
  const validatePhoneNumber = (text: string): string | null => {
    const clean = toEnglishNumbers(text);
    if (!clean)
      return t("validation.required", { field: t("auth.login.username") });

    // Starts with 09, followed by 9 digits = 11 digits total
    if (!/^09\d{9}$/.test(clean)) {
      return t("validation.phone_invalid");
    }
    return null;
  };

  // --- Combined Auth Identifier Validator ---
  const validateAuthIdentifier = (val: string): string | null => {
    const cleanVal = toEnglishNumbers(val.trim());

    // Use the translation key for the field title
    const fieldTitle = t("auth.login.username");

    if (!cleanVal) {
      // FIX: Passing the object for interpolation
      return t("validation.required", { field: fieldTitle });
    }

    // 1. Phone Number Logic
    if (cleanVal.startsWith("09") || cleanVal.startsWith("۰۹")) {
      const phoneRegex = /^09\d{9}$/;
      if (!phoneRegex.test(cleanVal)) return t("validation.phone_invalid");
      return null;
    }

    // 2. 10-Digit ID Logic
    if (cleanVal.length === 10) {
      if (checkIsNationalCode(cleanVal)) return null;

      // Distinguish between National ID and Foreign ID (usually starts with 9)
      if (cleanVal.startsWith("9")) {
        return t("validation.foreign_id_invalid");
      }
      return t("validation.national_id_invalid");
    }

    // 3. General Fallback
    return t("validation.identifier_invalid");
  };

  return {
    validateName,
    validateSlug,
    checkIsNationalCode,
    validatePassword,
    validateAuthIdentifier,
    validateAddress,
    validatePostalCode,
    validatePlate,
    validateUnit,
    validateEmail,
    passwordSecurityRate,
    validatePhoneNumber,
    validateDate,
    validateUrl,
    validateWhatsappUrl,
    validateSocialUsername,
  };
};
