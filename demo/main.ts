import { createApp } from "vue";
import { createPinia } from "pinia";
import { createI18n } from "vue-i18n";
import { BehayandChat } from "@behayand/chat";
import "@behayand/chat/style.css";

import App from "./App.vue";

const faModules = import.meta.glob<Record<string, unknown>>(
  "../i18n/locales/fa/*.json",
  { eager: true, import: "default" },
);
const faMessages = Object.values(faModules).reduce<Record<string, unknown>>(
  (acc, mod) => Object.assign(acc, mod),
  {},
);

const app = createApp(App);

app.use(createPinia());
app.use(
  createI18n({
    legacy: false,
    locale: "fa",
    messages: { fa: faMessages },
  }),
);
app.use(BehayandChat);

app.mount("#app");
