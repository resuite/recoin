import { TabSwitcher } from "@recoin/components";

const Tabs = () => {
   return (
      <div class="py-1 w-full">
         <h2 class="text-header px-1">Tabs</h2>
         <TabSwitcher
            class="tab-container h-screen"
            header:class="px-1"
            onActiveTabChange={(tab) =>
               console.log(`Tab ${String(tab.heading())} is now active`)
            }
            tabs={tabs}
         />
      </div>
   );
};

const tabs = [
   {
      heading: () => "Tab 1",
      body: () => (
         <div class="flex items-center justify-center w-full h-full">Tab 1</div>
      ),
   },
   {
      heading: () => "Tab 2",
      body: () => (
         <div class="flex h-full items-center justify-center w-full">Tab 2</div>
      ),
   },
   {
      heading: () => "Tab 3",
      body: () => (
         <div class="flex h-full items-center justify-center w-full">Tab 3</div>
      ),
   },
   {
      heading: () => "Tab 4",
      body: () => (
         <div class="flex items-center justify-center w-full h-full">Tab 4</div>
      ),
   },
   {
      heading: () => "Tab 5",
      body: () => (
         <div class="flex items-center justify-center w-full h-full">Tab 5</div>
      ),
   },
   {
      heading: () => "Tab 6",
      body: () => (
         <div class="flex items-center justify-center w-full h-full">Tab 6</div>
      ),
   },
   {
      heading: () => "Tab 7",
      body: () => (
         <div class="flex items-center justify-center w-full h-full">Tab 7</div>
      ),
   },
   {
      heading: () => "Tab 8",
      body: () => (
         <div class="flex items-center justify-center w-full h-full">Tab 8</div>
      ),
   },
   {
      heading: () => "Tab 9",
      body: () => (
         <div class="flex items-center justify-center w-full h-full">Tab 9</div>
      ),
   },
];

export default Tabs;
