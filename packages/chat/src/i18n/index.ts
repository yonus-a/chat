import faMessages from "./fa.json";

export type ChatLocaleMessages = Record<string, string | Record<string, string>>;

const locales: Record<string, ChatLocaleMessages> = {
  fa: faMessages,
};

let currentLocale = "fa";

/**
 * Set the current chat locale
 */
export function setChatLocale(locale: string) {
  currentLocale = locale;
}

/**
 * Register additional locale messages
 */
export function registerChatLocale(locale: string, messages: ChatLocaleMessages) {
  locales[locale] = messages;
}

/**
 * Get current locale
 */
export function getChatLocale(): string {
  return currentLocale;
}

/**
 * Translate a key using dot notation
 */
export function t(key: string, params?: Record<string, string>): string {
  const messages = locales[currentLocale] || locales["fa"];
  const keys = key.split(".");
  let result: any = messages;

  for (const k of keys) {
    if (result && typeof result === "object" && k in result) {
      result = result[k];
    } else {
      return key; // Return key as fallback
    }
  }

  if (typeof result !== "string") return key;

  // Simple parameter interpolation
  if (params) {
    return result.replace(/\{(\w+)\}/g, (_, name) => params[name] || `{${name}}`);
  }

  return result;
}
