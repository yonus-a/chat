import { defineNuxtPlugin } from "#imports";
import { createStores } from "~/stores/createStores";
import { createMockAdapter } from "~/adapter/mock";
import type { HostAdapter } from "~/adapter";

declare module "#app" {
  interface NuxtApp {
    $appStores: ReturnType<typeof createStores>;
  }
}

export default defineNuxtPlugin({
  name: "app-stores",
  enforce: "pre",
  setup(nuxtApp) {
    const hostAdapter: HostAdapter | undefined = (
      nuxtApp.$config.public as Record<string, unknown>
    ).hostAdapter as HostAdapter | undefined;

    const adapter: HostAdapter = hostAdapter ?? createMockAdapter();
    const appStores = createStores({ adapter });

    return {
      provide: {
        appStores,
      },
    };
  },
});
