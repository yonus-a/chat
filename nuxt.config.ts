// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs";
import path from "node:path";

const loadLocaleFiles = (lang: string) => {
  const dir = path.resolve(process.cwd(), "i18n", "locales", lang);
  if (!fs.existsSync(dir)) {
    console.warn(`[i18n] Directory not found: ${dir}`);
    return [];
  }
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => `${lang}/${file}`);
};

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  vite: {
    optimizeDeps: {
      include: ["@vue/devtools-core", "@vue/devtools-kit"],
    },
    plugins: [tailwindcss()],
  },
  modules: ["@nuxt/image", "@nuxtjs/i18n", "@pinia/nuxt"],
  components: [
    {
      path: "~/components/global",
      global: true,
    },
  ],
  i18n: {
    lazy: true,
    langDir: "locales",
    defaultLocale: "fa",
    strategy: "prefix_except_default",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root",
    },
    locales: [
      { code: "en", iso: "en-US", dir: "ltr", files: loadLocaleFiles("en") },
      { code: "fa", iso: "fa-IR", dir: "rtl", files: loadLocaleFiles("fa") },
      { code: "ar", iso: "Ar-UA", dir: "rtl", files: loadLocaleFiles("ar") },
    ],
  },
});
