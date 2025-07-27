import { defer } from '@/utilities/miscellaneous'
import { Cell, For, createScope, useObserver, useScopeContext } from 'retend'
import { useIntersectionObserver } from 'retend-utils/hooks'
import type { JSX } from 'retend/jsx-runtime'
import Add from '../icons/svg/add'
import styles from './toast.module.css'

interface ToastScopeData {
   activeToasts: Cell<Array<ToastProps & { id: string }>>
   toastPromiseResolvers: Map<string, () => void>
}
const ToastScope = createScope<ToastScopeData>()

export interface ToastProps {
   /**
    * The content to display in the toast notification.
    * Can be a string, JSX element, or any valid JSX template.
    * @example
    * // Simple text content
    * content: "Success!"
    *
    * // JSX content
    * content: <div><strong>Important:</strong> Please review.</div>
    */
   content: JSX.Template
   /**
    * Optional duration in milliseconds before the toast auto-dismisses.
    * If not provided, the toast will persist until manually dismissed.
    */
   duration?: number
   /**
    * Optional click handler for the toast.
    * @param {MouseEvent | KeyboardEvent} event - The click or keyboard event that triggered the handler.
    */
   onClick?: (event: MouseEvent | KeyboardEvent) => void
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
    * showToast({ content: "Hello!", duration: 2000 })
    *
    * // Show a more complex toast with JSX content that persists
    * showToast({ content: <div><strong>Important:</strong> Please review.</div> })
    * ```
    *
    * @returns A promise that resolves when the toast is dismissed.
    */
   showToast: (props: ToastProps) => Promise<void>
   /**
    * A `Cell` containing an array of all currently active toast notifications.
    * This can be observed to react to changes in the list of toasts (e.g., for
    * displaying a toast count or managing toast overflow).
    *
    * Direct modification of this `Cell`'s value is generally not recommended;
    * use `showToast` to add new toasts, and rely on the toast's internal
    * dismissal mechanisms (duration, swipe-to-dismiss, close button) to remove them.
    */
   activeToasts: Cell<readonly (ToastProps & { id: string })[]>
}

export interface ToastContainerProps {
   children: () => JSX.Template
}

export function ToastProvider(props: ToastContainerProps) {
   const { children } = props
   const activeToasts = Cell.source<Array<ToastProps & { id: string }>>([])
   const toastPromiseResolvers = new Map<string, () => void>()

   const toastsCount = Cell.derived(() => {
      return activeToasts.get().length
   })

   const value: ToastScopeData = { activeToasts, toastPromiseResolvers }

   return (
      <ToastScope.Provider value={value}>
         {() => (
            <>
               {children()}
               <div
                  class={styles.toastsGroup}
                  style={{
                     '--toasts-count': toastsCount,
                     '--toast-gap': 'calc(var(--spacing) * 0.5)'
                  }}
               >
                  {For(activeToasts, Toast)}
               </div>
            </>
         )}
      </ToastScope.Provider>
   )
}

function Toast(props: ToastProps & { id: string }, index: Cell<number>) {
   const { content, duration, onClick } = props
   const { activeToasts, toastPromiseResolvers } = useScopeContext(ToastScope)
   const observer = useObserver()
   let timeout: ReturnType<typeof setTimeout> | null = null
   const toastElementRef = Cell.source<HTMLDialogElement | null>(null)
   const toastContainerRef = Cell.source<HTMLElement | null>(null)
   const leftDismissMarkerRef = Cell.source<HTMLElement | null>(null)
   const rightDismissMarkerRef = Cell.source<HTMLElement | null>(null)

   // --- Swipe-to-Dismiss Logic ---
   // This callback is triggered by the IntersectionObserver when a dismiss marker
   // becomes fully visible (meaning the user has swiped the toast off-screen).
   const closeToast = () => {
      const element = toastElementRef.get()
      if (!element) {
         return
      }
      element.classList.add(styles.toastLeaving)
      defer(async () => {
         await Promise.allSettled(
            element.getAnimations().map((a) => {
               return a.finished
            })
         )
         toastPromiseResolvers.get(props.id)?.()
         toastPromiseResolvers.delete(props.id)
         activeToasts.get().splice(index.get(), 1)
      })
   }

   const handleClick = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && event.key !== 'Enter') {
         return
      }
      if (onClick) {
         onClick(event)
      }
   }

   observer.onConnected(toastElementRef, (toastElement) => {
      // Initial setup for swipe-to-dismiss:
      // Scroll the individual toast's wrapper to center the actual toast content.
      // The wrapper (`div.toast-container`) has a 3-column grid:
      // [left-marker, toast-content, right-marker] with large gaps,
      // making markers initially off-screen.
      toastElement.scrollIntoView({ inline: 'center' })
      if (duration !== undefined) {
         timeout = setTimeout(closeToast, duration)
      }
      return () => {
         if (timeout !== null) {
            clearTimeout(timeout)
         }
      }
   })

   // Use useIntersectionObserver for swipe-to-dismiss
   const handleDismissIntersection: IntersectionObserverCallback = (entries) => {
      for (const entry of entries) {
         if (!entry?.isIntersecting) {
            continue
         }
         // No point waiting for an animation, because the toast
         // itself will not be visible.
         activeToasts.get().splice(index.get(), 1)
         toastPromiseResolvers.get(props.id)?.()
         toastPromiseResolvers.delete(props.id)
      }
   }

   useIntersectionObserver(
      [leftDismissMarkerRef, rightDismissMarkerRef],
      handleDismissIntersection,
      () => {
         return { root: toastContainerRef.peek(), threshold: 0.3 }
      }
   )

   return (
      <div
         class={styles.toastContainer}
         style={{ '--toast-index': index }}
         ref={toastContainerRef}
      >
         <div ref={leftDismissMarkerRef} class={styles.toastDismissMarker} />
         <dialog
            open
            ref={toastElementRef}
            class={styles.toast}
            onClick={handleClick}
            onKeyDown={handleClick}
         >
            <div>{content}</div>
            <button type='button' class={styles.toastCloseButton} onClick={closeToast}>
               <Add class={styles.toastCloseButtonIcon} />
            </button>
         </dialog>
         <div ref={rightDismissMarkerRef} class={styles.toastDismissMarker} />
      </div>
   )
}

/**
 * Provides functionality for displaying and managing toast notifications.
 *
 * Render `<ToastProvider />` once at a high level in your application (e.g., in your root layout).
 * Then, call `showToast(props)` whenever you need to display a notification.
 *
 * @example
 * ```tsx
 * // in layout
 * function App() {
 *   return (
 *     <ToastProvider>
 *       {() => <AppContent />}
 *     </ToastProvider>
 *   )
 * }
 *
 * // use the toasts in your content
 * function AppContent() {
 *   const { showToast } = useToast()
 *
 *   const handleShowSuccessToast = () => {
 *     showToast({ content: <p>Operation successful!</p>, duration: 3000 })
 *   }
 *
 *   const handleShowErrorToast = () => {
 *     showToast({ content: <strong>Error: Something went wrong.</strong> })
 *   }
 *
 *   return (
 *     <div>
 *       <button onClick={handleShowSuccessToast}>Show Success</button>
 *       <button onClick={handleShowErrorToast}>Show Persistent Error</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useToast(): ToastDetails {
   const { activeToasts, toastPromiseResolvers } = useScopeContext(ToastScope)

   const showToast = (props: ToastProps) => {
      const id = crypto.randomUUID()
      activeToasts.get().push({ ...props, id })
      const promise = new Promise<void>((resolve) => {
         toastPromiseResolvers.set(id, resolve)
      })
      return promise
   }

   return { showToast, activeToasts }
}
