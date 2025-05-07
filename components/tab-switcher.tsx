import { Cell, For, useObserver, type SourceCell } from "retend";
import type { JSX } from "retend/jsx-runtime";
import { useDerivedValue } from "retend-utils/hooks";
import { scrollTimelineFallback } from "./utils";

type SectionProps = JSX.IntrinsicElements["section"];
export interface Tab {
   heading: () => JSX.Template;
   body: () => JSX.Template;
}

export interface TabsProps<T extends Tab> extends SectionProps {
   /**
    * Specifies the tabs to be displayed. Can be a static array or a reactive cell.
    */
   tabs: JSX.ValueOrCell<Array<T>>;
   /**
    * An optional `SourceCell` to capture a reference to the component's root HTML element.
    */
   ref?: SourceCell<HTMLElement | null>;
   /**
    * An optional callback function that is invoked when the active tab changes.
    * It receives the new active tab.
    */
   onActiveTabChange?: (activeTab: Tab) => void;
   /**
    * Classes to be applied to the header element.
    */
   "header:class"?: unknown;
}

/**
 * A component that creates a tabbed interface with smooth scrolling and intersection observation.
 *
 * @component
 * @param {TabsProps} props - The props for the TabSwitcher component
 *
 * @features
 * - Smooth scrolling between tabs
 * - Intersection observer to detect active tab
 * - Header marker that follows active tab
 * - Touch-friendly with snap points
 * - Handles both click and swipe navigation
 * - Responsive design with scroll timeline animation
 *
 * @example
 * ```tsx
 * const tabs = [
 *   { heading: () => <span>Tab 1</span>, body: () => <div>Content 1</div> },
 *   { heading: () => <span>Tab 2</span>, body: () => <div>Content 2</div> }
 * ];
 *
 * <TabSwitcher
 *   tabs={tabs}
 *   onActiveTabChange={(tab) => console.log(`Tab ${tab.heading()} is now active`)}
 *  />;
 * ```
 */
export function TabSwitcher<T extends Tab>(props: TabsProps<T>) {
   const {
      tabs: tabsProp,
      ref: tabContainerRef = Cell.source<HTMLElement | null>(null),
      "header:class": headerClasses,
      onActiveTabChange,
      ...rest
   } = props;
   const observer = useObserver();
   const tabs = useDerivedValue(tabsProp);
   const tabCount = Cell.derived(() => tabs.get().length);
   const headerRef = Cell.source<HTMLElement | null>(null);
   const activeTab = Cell.source(0);
   /**
    * If the scroll to a tab is triggered by a click
    * on the tab header, the active tab value will fluctuate as
    * the intermediate tabs become active and inactive rapidly.
    *
    * This variable prevents any other tab from becoming active
    * until the clicked tab is done scrolling into view.
    */
   let detectActiveTabOnScroll = true;

   const scrollToTab = (index: number) => {
      const tabContainer = tabContainerRef.get();
      if (!tabContainer) return;

      detectActiveTabOnScroll = false;
      tabContainer.scrollTo({ left: index * tabContainer.clientWidth });
      activeTab.set(index);
   };

   activeTab.listen((index) => {
      const header = headerRef.peek();
      if (!header) return;

      const paddingLeft = getComputedStyle(header).paddingLeft.slice(0, -2);
      header.scrollTo({
         left: index * ((header.scrollWidth + -paddingLeft) / tabCount.get()),
      });
      onActiveTabChange?.(tabs.get()[index]);
   });

   // Intersection observer to determine the active tab
   let intersectObserver: IntersectionObserver;
   const callback: IntersectionObserverCallback = ([entry]) => {
      if (!entry.isIntersecting) return;
      const tab = entry.target as HTMLElement;
      const index = Number(tab.dataset.tabIndex);
      if (detectActiveTabOnScroll) activeTab.set(index);
      else if (index === activeTab.get()) {
         // When the active tab is done being scrolled into view,
         // we need a way to reset the flag so that swipes can be detected.
         // We can't use the scrollend event because it doesn't fire on iOS.
         // So we wait until the (already) active tab enters the viewport, which signifies
         // that scrolling is (almost) done and reactivate the flag.
         detectActiveTabOnScroll = true;
      }
   };
   observer.onConnected(tabContainerRef, (element) => {
      const options = { root: element, threshold: 0.45 };
      intersectObserver = new IntersectionObserver(callback, options);
      return () => intersectObserver.disconnect();
   });

   // Polyfill animation-timeline: scroll() on unsupported browsers.
   observer.onConnected(tabContainerRef, scrollTimelineFallback);

   return (
      <section
         {...rest}
         ref={tabContainerRef}
         style={{ "--tabs": tabCount }}
         class={[
            "grid grid-rows-[auto_1fr]",
            "overflow-scroll no-scrollbar scroll-smooth snap-x snap-mandatory",
            "animate-scrolling",
            rest.class,
         ]}
      >
         <header
            ref={headerRef}
            class={[
               "grid grid-cols-[auto_auto_1fr] scroll-smooth overflow-x-auto no-scrollbar sticky left-0 top-0",
               "after:h-[3px] after:self-end after:w-full after:bg-(--canvas-text) after:[grid-area:1/2]",
               "after:[translate:calc(var(--scroll-unit)*(var(--tabs)-1)*100%)]",
               headerClasses,
            ]}
         >
            {For(tabs, (tab, index) => {
               const style = {
                  marginLeft: Cell.derived(() => `calc(${index.get()}*100%)`),
               };
               const isActiveTab = Cell.derived(
                  () => index.get() === activeTab.get(),
               );
               return (
                  <button
                     type="button"
                     style={style}
                     data-tab-heading-index={index}
                     data-active={isActiveTab}
                     class={[
                        "button-bare [grid-area:1/2] min-w-3.5 not-[[data-active]]:opacity-60",
                        "duration-(--default-speed) ease-in-out",
                     ]}
                     onClick={() => scrollToTab(index.get())}
                  >
                     <tab.heading />
                  </button>
               );
            })}
         </header>
         <div
            class={[
               "grid grid-cols-[repeat(var(--tabs),100%)] grid-rows-1 w-full",
               "min-h-full max-h-0", // CSS is beautiful.
            ]}
         >
            {For(tabs, (tab, index) => {
               const ref = Cell.source<HTMLElement | null>(null);
               const observer = useObserver();

               const isNotActive = Cell.derived(
                  () => index.get() !== activeTab.get(),
               );

               observer.onConnected(ref, (element) => {
                  intersectObserver.observe(element);
                  return () => intersectObserver.unobserve(element);
               });
               return (
                  <div
                     ref={ref}
                     data-tab-index={index}
                     ariaHidden={isNotActive}
                     class={[
                        "flex items-start justify-items-start snap-start self-start justify-self-start [scroll-snap-stop:always] w-full h-full max-h-full overflow-auto no-scrollbar",
                        "[&[aria-hidden=true]]:pointer-events-none",
                     ]}
                  >
                     <tab.body />
                  </div>
               );
            })}
         </div>
      </section>
   );
}
