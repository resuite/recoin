import { defineConfig } from "vite";
import path from "node:path";
import { retend } from "retend/plugin";
import { retendSSG } from "retend-server/plugin";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
   resolve: {
      alias: {
         "@recoin/components": path.resolve(
            __dirname,
            "../../components/index.tsx",
         ),
      },
   },
   server: {
      allowedHosts: ["eyd.adebola.online"],
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
