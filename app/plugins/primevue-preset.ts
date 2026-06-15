import { defineNuxtPlugin } from "#app";
import MyCustomPT from "../../mycustompt";

export default defineNuxtPlugin({
  name: "primevue-custom-preset",
  enforce: "post", // Ensures this runs after the official module
  setup(nuxtApp) {
    // Intercept and mutate the PrimeVue reactive config directly
    const primevue = nuxtApp.vueApp.config.globalProperties.$primevue;

    if (primevue) {
      primevue.config.unstyled = true; // Strip default styles
      primevue.config.pt = MyCustomPT; // Inject your custom component classes
    }
  },
});
