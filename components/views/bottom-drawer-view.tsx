import { animationsSettled } from '@/utilities/animations'
import { defer } from '@/utilities/miscellaneous'
import { Cell, If, type SourceCell, useObserver } from 'retend'
import { useDerivedValue, useIntersectionObserver } from 'retend-utils/hooks'
import type { JSX } from 'retend/jsx-runtime'
import { useRouteQuery } from 'retend/router'
import { Teleport } from 'retend/teleport'
import styles from './bottom-drawer-view.module.css'

type DivProps = JSX.IntrinsicElements['div']

interface BottomDrawerProps extends DivProps {
   isOpen: JSX.ValueOrCell<boolean>
   onClose?: () => void
   content: () => JSX.Template
   dialogRef?: SourceCell<HTMLDialogElement | null>
   ref?: SourceCell<HTMLElement | null>
}

interface QueryControlledBottomDrawerProps
   extends Omit<BottomDrawerProps, 'isOpen'> {
   queryKey: string
   value?: JSX.ValueOrCell<string>
}

/**
 * A bottom-aligned drawer component that can be opened and closed.
 *
 * The drawer supports closing by clicking outside its content area
 * or by a "pull-down" gesture on its content.
 *
 * @param {BottomDrawerProps} props - The properties for the BottomDrawer component.
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const isDrawerOpen = Cell.source(false)
 *
 *   return (
 *     <>
 *       <button onClick={() => isDrawerOpen.set(true)}>Open Drawer</button>
 *       <BottomDrawer
 *         isOpen={isDrawerOpen}
 *         onClose={() => isDrawerOpen.set(false)}
 *         content={() => (
 *           <div>
 *             <h3>Drawer Content</h3>
 *             <p>This is some content inside the bottom drawer.</p>
 *             <button onClick={() => isDrawerOpen.set(false)}>Close</button>
 *           </div>
 *         )}
 *       />
 *     </>
 *   )
 * }
 * ```
 */
export function BottomDrawer(props: BottomDrawerProps) {
   const {
      isOpen: isOpenProp,
      dialogRef = Cell.source(null),
      ref: contentRef = Cell.source<HTMLElement | null>(null),
      content,
      onClose,
      ...rest
   } = props
   const observer = useObserver()
   const isOpen = useDerivedValue(isOpenProp)
   const dialogOpen = Cell.source(isOpen.get())
   const containerRef = Cell.source<HTMLElement | null>(null)

   async function startCloseSequence() {
      dialogRef.peek()?.classList.add(styles.closing)
      await animationsSettled(contentRef)
   }

   async function handleClickOutside() {
      await startCloseSequence()
      onClose?.()
   }

   async function handleIsOpenChange(isOpen: boolean) {
      const dialogElement = dialogRef.peek()
      if (isOpen && !dialogElement?.open) {
         // opening the drawer
         dialogOpen.set(isOpen)
         dialogElement?.show()
      } else if (!isOpen && dialogElement?.open) {
         // closing the drawer
         await startCloseSequence()
         dialogOpen.set(isOpen)
         dialogElement?.close()
      }
   }

   let drawerAppended = false
   function recurringAppendListener() {
      if (!containerRef.peek()?.isConnected && drawerAppended) {
         return
      }

      // The 'pull' behavior is created using scroll snaps, and the intersection
      // observer checks that the user has pulled down a reasonable amount
      // before closing.
      useIntersectionObserver(
         contentRef,
         ([entry]) => {
            const dialog = dialogRef.peek()
            const shouldClose =
               !entry.isIntersecting &&
               entry.intersectionRatio !== 0 &&
               dialog?.classList.contains(styles.snapped)

            if (shouldClose) {
               const content = contentRef.get()
               if (!content) {
                  return
               }
               // The drawer's "pull" is CSS scroll, not translation.
               // To avoid a visual jump before animating out, this sets the content's `translateY`
               // to its current scrolled position, ensuring a smooth transition.
               const contentRectBeforeClose = content.getBoundingClientRect()
               const initialDistanceFromViewportTop =
                  window.innerHeight - contentRectBeforeClose.height
               const currentDistanceFromViewportTop = contentRectBeforeClose.y
               const distanceToTranslate =
                  currentDistanceFromViewportTop -
                  initialDistanceFromViewportTop

               content.style.translate = `0px ${distanceToTranslate}px`

               onClose?.()
            }
         },
         () => ({
            root: dialogRef.peek(),
            threshold: 0.3
         })
      )

      observer.onConnected(dialogRef, async (dialog) => {
         drawerAppended = true
         handleIsOpenChange(isOpen.get())
         await animationsSettled(contentRef)
         dialog.classList.add(styles.snapped)
         dialog.scrollTo({ top: dialog.scrollHeight, behavior: 'instant' })
         defer(() => {
            // Omo idk. If either of the scrollTo() calls is
            // removed, the drawer content either glitches or doesn't scroll to the bottom.
            // Sometimes in Firefox, sometimes in Chromium (gasp), sometimes in Safari.
            dialog.scrollTo({ top: dialog.scrollHeight, behavior: 'instant' })
         })

         // TODO: Move this behavior into Retend. Currently,
         // after an observer callback runs, it is disposed,
         // and doesn't get re-run when the same element
         // is removed and connected again.
         return recurringAppendListener
      })
   }

   recurringAppendListener()
   isOpen.listen(handleIsOpenChange)

   return (
      <Teleport to='body' ref={containerRef}>
         {If(dialogOpen, () => {
            return (
               <dialog
                  ref={dialogRef}
                  data-content-open={isOpen}
                  class={styles.dialog}
                  onClick--self={handleClickOutside}
               >
                  <div
                     {...rest}
                     ref={contentRef}
                     class={[styles.drawerContentContainer, rest.class]}
                  >
                     {content()}
                  </div>
               </dialog>
            )
         })}
      </Teleport>
   )
}

/**
 * A bottom-aligned drawer component whose open state is controlled by a URL query parameter.
 *
 * This component wraps the `BottomDrawer` and manages its `isOpen` and `onClose` props
 * based on the presence and value of a specified query parameter in the URL.
 *
 * When the query parameter specified by `queryKey` is present in the URL, the drawer
 * will be open. If a `value` is provided, the drawer will only open if the query
 * parameter's value matches the specified `value`.
 *
 * Closing the drawer (either via user interaction or calling `onClose`) will remove
 * the `queryKey` from the URL's query parameters.
 *
 * @param {QueryControlledBottomDrawerProps} props - The properties for the QueryControlledBottomDrawer component.
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   // To open this drawer, the URL would need to be something like:
 *   // /some/path?drawer=true
 *   return (
 *     <QueryControlledBottomDrawer
 *       queryKey="drawer"
 *       value="true"
 *       content={() => (
 *         <div>
 *           <h3>Query Controlled Drawer</h3>
 *           <p>This drawer opens when 'drawer=true' is in the URL.</p>
 *         </div>
 *       )}
 *     />
 *   )
 * }
 *
 * const AnotherComponent = () => {
 *   // To open this drawer, the URL would need to be something like:
 *   // /another/path?myDialog
 *   // (No specific value required, just the presence of 'myDialog' key)
 *   return (
 *     <QueryControlledBottomDrawer
 *       queryKey="myDialog"
 *       content={() => (
 *         <div>
 *           <h3>Simple Query Controlled Drawer</h3>
 *           <p>This drawer opens when 'myDialog' is present in the URL.</p>
 *         </div>
 *       )}
 *     />
 *   )
 * }
 * ```
 */
export function QueryControlledBottomDrawer(
   props: QueryControlledBottomDrawerProps
) {
   const { queryKey, value: valueProp, content, ...rest } = props
   const value = useDerivedValue(valueProp)
   const query = useRouteQuery()

   const routeHasKey = query.has(queryKey)
   const routeKeyValue = query.get(queryKey)

   const isOpen = Cell.derived(() => {
      if (!routeHasKey.get()) {
         return false
      }
      if (routeKeyValue.get() === value.get()) {
         return true
      }
      return routeHasKey.get() && value.get() === undefined
   })

   function onClose() {
      query.delete(queryKey)
   }

   return (
      <BottomDrawer
         isOpen={isOpen}
         onClose={onClose}
         content={content}
         {...rest}
      />
   )
}
