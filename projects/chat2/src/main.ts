import { createApp } from "vue";
import { createPinia } from "pinia";
import { createI18n } from "vue-i18n";
import router from "./router";
import App from "./App.vue";
import loadingDirective from "./directives/loading";
import "./styles/main.css";

// Import translations
import chatMessages from "./i18n/locales/fa/chat.json";
import generalMessages from "./i18n/locales/fa/general.json";
import seoMessages from "./i18n/locales/fa/seo.json";

const messages = {
  fa: {
    ...chatMessages,
    ...generalMessages,
    ...seoMessages,
  },
};

const i18n = createI18n({
  legacy: false,
  locale: "fa",
  fallbackLocale: "fa",
  messages,
});

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(i18n);
app.directive("loading", loadingDirective);

app.mount("#app");
