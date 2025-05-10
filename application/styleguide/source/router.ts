import { createWebRouter } from "retend/router";
import Styleguide from ".";
import Tabs from "./tabs";
import NavStack from "./nav-stack";
import Toast from "./toast";
import PullZoneTest from "./pull-zone";

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
         {
            name: "styleguide-toast",
            path: "/toast",
            component: Toast,
         },
         {
            name: "styleguide-pull-zone",
            path: "/pull-zone",
            component: PullZoneTest,
         },
      ],
   });
}
