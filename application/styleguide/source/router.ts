import { createWebRouter } from "retend/router";
import Styleguide from ".";
import Tabs from "./tabs";
import NavStack from "./nav-stack";

export function createRouter() {
   return createWebRouter({
      routes: [
         {
            name: "styleguide",
            path: "/",
            component: Styleguide,
         },
         {
            name: "styleguide-tabs",
            path: "/tabs",
            component: Tabs,
         },
         {
            name: "styleguide-nav-stack",
            path: "/nav-stack",
            component: NavStack,
         },
      ],
   });
}
