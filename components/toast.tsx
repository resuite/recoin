import { Cell, For, useObserver } from "retend";
import type { JSX } from "retend/jsx-runtime";
import Add from "./icons/add";

export interface ToastProps {
   content: JSX.Template;
   duration?: number;
}

export interface ToastDetails {
   /**
    * Displays a new toast message on the screen.
    *
    * @param {ToastProps} props - The properties for the toast to be displayed.
    *                             See {@link ToastProps} for details.
    * @example
    * ```tsx
    * // Show a simple message that auto-dismisses after 2 seconds
    * showToast({ content: "Hello!", duration: 2000 });
    *
    * // Show a more complex toast with JSX content that persists
    * showToast({ content: <div><strong>Important:</strong> Please review.</div> });
    * ```
    */
   showToast: (props: ToastProps) => void;
   ToastContainer: () => JSX.Template;
   activeToasts: Cell<Array<ToastProps>>;
}

/**
 * Provides functionality for displaying and managing toast notifications.
 *
 * To use, call this hook in your component to get `showToast` and `ToastContainer`.
 * Render `<ToastContainer />` once at a high level in your application (e.g., in your root layout).
 * Then, call `showToast(props)` whenever you need to display a notification.
 *
 * @example
 * ```tsx
 * function AppContent() {
 *   const { showToast, ToastContainer } = useToast();
 *
 *   const handleShowSuccessToast = () => {
 *     showToast({ content: <p>Operation successful!</p>, duration: 3000 });
 *   };
 *
 *   const handleShowErrorToast = () => {
 *     showToast({ content: <strong>Error: Something went wrong.</strong> });
 *   };
 *
 *   return (
 *     <div>
 *       <ToastContainer />
 *       <button onClick={handleShowSuccessToast}>Show Success</button>
 *       <button onClick={handleShowErrorToast}>Show Persistent Error</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useToast(): ToastDetails {
   const activeToasts = Cell.source<Array<ToastProps>>([]);

   function showToast(props: ToastProps) {
      activeToasts.get().push(props);
   }

   function Toast(props: ToastProps, index: Cell<number>) {
      const { content, duration } = props;
      const observer = useObserver();
      let timeout: ReturnType<typeof setTimeout> | null = null;
      const toastElementRef = Cell.source<HTMLDialogElement | null>(null);
      const toastContainerRef = Cell.source<HTMLElement | null>(null);
      const leftDismissMarkerRef = Cell.source<HTMLElement | null>(null);
      const rightDismissMarkerRef = Cell.source<HTMLElement | null>(null);

      // --- Swipe-to-Dismiss Logic ---
      // This callback is triggered by the IntersectionObserver when a dismiss marker
      // becomes fully visible (meaning the user has swiped the toast off-screen).
      let intersectObserver: IntersectionObserver;
      const intersectionCallback: IntersectionObserverCallback = ([entry]) => {
         if (!entry.isIntersecting) return;
         // No point waiting for an animation, because the toast
         // itself will not be visible.
         activeToasts.get().splice(index.get(), 1);
      };

      const closeToast = async () => {
         const element = toastElementRef.get();
         if (!element) return;
         element.classList.add("animate-toast-leave");
         await Promise.allSettled(
            element.getAnimations().map((a) => a.finished),
         );
         activeToasts.get().splice(index.get(), 1);
      };

      observer.onConnected(toastContainerRef, (container) => {
         // Initial setup for swipe-to-dismiss:
         // 1. Scroll the individual toast's wrapper to center the actual toast content.
         //    The wrapper (`div.toast-container`) has a 3-column grid:
         //    [left-marker, toast-content, right-marker] with large gaps,
         //    making markers initially off-screen.
         toastElementRef.get()?.scrollIntoView({ inline: "center" });
         // 2. Setup IntersectionObserver to watch the off-screen dismiss markers.
         //    `root` is this toast's scrollable wrapper.
         intersectObserver = new IntersectionObserver(intersectionCallback, {
            root: container,
            threshold: 0.3,
         });
         return () => intersectObserver.disconnect();
      });

      observer.onConnected(toastElementRef, () => {
         if (duration !== undefined) timeout = setTimeout(closeToast, duration);
         return () => {
            if (timeout !== null) clearTimeout(timeout);
         };
      });

      observer.onConnected(leftDismissMarkerRef, (leftHandle) => {
         intersectObserver.observe(leftHandle);
         return () => intersectObserver.unobserve(leftHandle);
      });

      observer.onConnected(rightDismissMarkerRef, (rightHandle) => {
         intersectObserver.observe(rightHandle);
         return () => intersectObserver.unobserve(rightHandle);
      });

      return (
         <div
            class="toast-container"
            style={{ "--toast-index": index }}
            ref={toastContainerRef}
         >
            <div ref={leftDismissMarkerRef} class="toast-dismiss-marker" />
            <dialog open ref={toastElementRef} class="toast">
               <div>{content}</div>
               <button
                  type="button"
                  class="button-bare min-w-fit p-0"
                  onClick={closeToast}
               >
                  <Add class="w-1 h-1 rotate-45" />
               </button>
            </dialog>
            <div ref={rightDismissMarkerRef} class="toast-dismiss-marker" />
         </div>
      );
   }

   function ToastContainer() {
      const toastsCount = Cell.derived(() => activeToasts.get().length);
      return (
         <div
            class="toasts-group"
            style={{
               "--toasts-count": toastsCount,
               "--toast-gap": "calc(var(--spacing) * 0.25)",
            }}
         >
            {For(activeToasts, Toast)}
         </div>
      );
   }

   return {
      showToast,
      ToastContainer,
      activeToasts,
   };
}
