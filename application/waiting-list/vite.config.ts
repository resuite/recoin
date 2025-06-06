import { defineConfig } from "vite";
import { retend } from "retend/plugin";
import { retendSSG } from "retend-server/plugin";

export default defineConfig({
   plugins: [
      retend(),
      retendSSG({
         pages: ["/"],
         routerModulePath: "./source/router.ts",
      }),
   ],
});
