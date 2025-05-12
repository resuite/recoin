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
            name: "styleguide-root",
            path: "/",
            metadata: {
               title: "Styleguide",
               description: "A styleguide for recoin.",
               charset: "utf-8",
               viewport: "width=device-width, initial-scale=1.0",
               themeColor: "#272727",
               manifest: "/manifest.json",
            },
            children: [
               {
                  name: "styleguide",
                  path: "",
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
            ]
         }
      ],
   });
}
