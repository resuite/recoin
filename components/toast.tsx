import { Cell, For, useObserver } from "retend";
import type { JSX } from "retend/jsx-runtime";
import Add from "./icons/add";

export interface ToastProps {
   content: JSX.Template;
   duration?: number;
}

export interface ToastDetails {
   showToast: (props: ToastProps) => void;
   ToastContainer: () => JSX.Template;
   activeToasts: Cell<Array<ToastProps>>;
}

export const useToast = () => {
   const activeToasts = Cell.source<Array<ToastProps>>([]);

   function showToast(props: ToastProps) {
      activeToasts.get().push(props);
   }

   function Toast(props: ToastProps, index: Cell<number>) {
      const ref = Cell.source<HTMLDialogElement | null>(null);
      const observer = useObserver();
      let timeout: ReturnType<typeof setTimeout> | null = null;

      const closeToast = async () => {
         const element = ref.get();
         if (!element) return;
         element.classList.add("animate-toast-leave");
         await Promise.allSettled(
            element.getAnimations().map((a) => a.finished),
         );
         activeToasts.get().splice(index.get(), 1);
      };

      observer.onConnected(ref, () => {
         if (props.duration) timeout = setTimeout(closeToast, props.duration);
         return () => {
            if (timeout) clearTimeout(timeout);
         };
      });

      return (
         <dialog
            open
            ref={ref}
            class="toast-container"
            style={{ "--toast-index": index }}
         >
            <div>{props.content}</div>
            <button
               type="button"
               class="button-bare min-w-fit p-0"
               onClick={closeToast}
            >
               <Add class="w-1 h-1 rotate-45" />
            </button>
         </dialog>
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
};
