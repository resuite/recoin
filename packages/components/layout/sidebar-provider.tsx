import type { JSX } from "retend/jsx-runtime";
import styles from "./sidebar-provider.module.css";
import { Cell, useObserver } from "retend";
import { scrollTimelineFallback } from "../utils";
import { useDerivedValue, useIntersectionObserver } from "retend-utils/hooks";

type DivProps = JSX.IntrinsicElements["div"];

export interface SidebarProviderProps extends DivProps {
   sidebar: () => JSX.Template;
   ref?: Cell<HTMLElement | null>;
   /**
    * An external Cell to hold whether it should be
    * possible to reveal the sidebar.
    */
   allowReveal?: JSX.ValueOrCell<boolean>;
}

export function SidebarProvider(props: SidebarProviderProps) {
   const {
      sidebar,
      children,
      ref: providerRef = Cell.source<HTMLElement | null>(null),
      allowReveal: allowRevealProp = Cell.source(true),
      ...rest
   } = props;
   const contentRef = Cell.source<HTMLElement | null>(null);
   const sidebarRef = Cell.source<HTMLElement | null>(null);
   const observer = useObserver();
   const sidebarOpened = Cell.source(false);
   const allowReveal = useDerivedValue(allowRevealProp);
   const sidebarNotRevealable = Cell.derived(() => allowReveal.get() === false);

   observer.onConnected(providerRef, scrollTimelineFallback);
   observer.onConnected(contentRef, (content) => {
      content.scrollIntoView({ behavior: "instant", inline: "start" });
   });

   useIntersectionObserver(
      sidebarRef,
      ([entry]) => {
         if (entry === undefined) return;
         sidebarOpened.set(entry.isIntersecting);
         navigator.vibrate?.([5, 5]);
      },
      () => ({ root: providerRef.peek(), threshold: 0.9 })
   );

   return (
      <div
         {...rest}
         ref={providerRef}
         class={[
            styles.provider,
            "animate-scrolling",
            { "overflow-hidden": sidebarNotRevealable },
            rest.class,
         ]}
      >
         <div ref={sidebarRef} class={styles.sidebar}>
            {sidebar()}
         </div>
         <div
            ref={contentRef}
            class={[
               styles.content,
               { "touch-none pointer-events-none": sidebarOpened },
            ]}
         >
            {children}
         </div>
      </div>
   );
}
