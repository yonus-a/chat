import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  plugins: [vue()],
  resolve: {
    alias: {
      "@behayand/chat/style.css": fileURLToPath(
        new URL("../dist/style.css", import.meta.url),
      ),
      "@behayand/chat": fileURLToPath(
        new URL("../dist/index.mjs", import.meta.url),
      ),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 3000,
    strictPort: false,
  },
});
