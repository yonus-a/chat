import loadingDirective from "~/directives/loading";
import imagePicker from "~/directives/imagePicker";
import filePicker from "~/directives/filePicker";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive("loading", loadingDirective);
  nuxtApp.vueApp.directive("image-pick", imagePicker);
  nuxtApp.vueApp.directive("file-pick", filePicker);
});
