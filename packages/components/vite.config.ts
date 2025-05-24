import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { retend } from "retend/plugin";
import tailwindcss from "@tailwindcss/vite";
import dts from "vite-plugin-dts";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
   build: {
      lib: {
         entry: resolve(__dirname, "index.tsx"),
         name: "recoin-components",
         fileName: "recoin-components",
      },
      rollupOptions: {
         external: ["retend", "retend-server", "retend-utils"],
         output: {
            globals: {
               retend: "retend",
            },
         },
      },
   },
   plugins: [tailwindcss(), dts()],
});
