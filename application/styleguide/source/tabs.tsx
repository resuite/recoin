import { TabSwitcher } from '@recoin/components/layout';

const Tabs = () => {
   const handleTabChange = (tab: (typeof tabs)[number]) => {
      console.log(`Tab ${String(tab.heading())} is now active`);
   };

   return (
      <div class='py-1 w-full h-screen grid grid-rows-[auto_1fr] light-scheme rounded-t-4xl'>
         <h2 class='text-title px-1'>Tabs</h2>
         <TabSwitcher
            class='tab-container'
            header:class='px-1'
            onActiveTabChange={handleTabChange}
            tabs={tabs}
         />
      </div>
   );
};

const tabs = [
   {
      heading: () => 'Tab 1',
      body: () => (
         <div class='flex items-center justify-center w-full h-full'>Tab 1</div>
      ),
   },
   {
      heading: () => 'Tab 2',
      body: () => (
         <div class='flex h-full items-center justify-center w-full'>Tab 2</div>
      ),
   },
   {
      heading: () => 'Tab 3',
      body: () => (
         <div class='flex h-full items-center justify-center w-full'>Tab 3</div>
      ),
   },
   {
      heading: () => 'Tab 4',
      body: () => (
         <div class='flex items-center justify-center w-full h-full'>Tab 4</div>
      ),
   },
   {
      heading: () => 'Tab 5',
      body: () => (
         <div class='flex items-center justify-center w-full h-full'>Tab 5</div>
      ),
   },
   {
      heading: () => 'Tab 6',
      body: () => (
         <div class='flex items-center justify-center w-full h-full'>Tab 6</div>
      ),
   },
   {
      heading: () => 'Tab 7',
      body: () => (
         <div class='flex items-center justify-center w-full h-full'>Tab 7</div>
      ),
   },
   {
      heading: () => 'Tab 8',
      body: () => (
         <div class='flex items-center justify-center w-full h-full'>Tab 8</div>
      ),
   },
   {
      heading: () => 'Tab 9',
      body: () => (
         <div class='flex items-center justify-center w-full h-full'>Tab 9</div>
      ),
   },
];

export default Tabs;
