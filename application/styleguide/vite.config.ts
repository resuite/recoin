import { defineConfig } from "vite";
import { retend } from "retend/plugin";
import { retendSSG } from "retend-server/plugin";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
   server: {
      // abeg abeg abeg
      allowedHosts: true,
      cors: {
         origin: true,
      },
   },
   plugins: [
      tailwindcss(),
      retend(),
      retendSSG({
         pages: ["/"],
         routerModulePath: "./source/router.ts",
      }),
   ],
});
