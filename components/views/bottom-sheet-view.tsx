import { animationsSettled } from '@/utilities/animations'
import { defer } from '@/utilities/miscellaneous'
import { Cell, If, type SourceCell, useObserver } from 'retend'
import { useDerivedValue, useIntersectionObserver } from 'retend-utils/hooks'
import type { JSX } from 'retend/jsx-runtime'
import { useRouteQuery } from 'retend/router'
import styles from './bottom-sheet-view.module.css'

type DivProps = JSX.IntrinsicElements['div']

interface BottomSheetProps extends DivProps {
   isOpen: JSX.ValueOrCell<boolean>
   onClose?: () => void
   children: () => JSX.Template
   ref?: SourceCell<HTMLElement | null>
}

interface QueryControlledBottomSheetProps extends Omit<BottomSheetProps, 'isOpen'> {
   queryKey: string
   value?: JSX.ValueOrCell<string>
}

/**
 * A bottom-aligned sheet component that can be opened and closed.
 *
 * The sheet supports closing by clicking outside its content area
 * or by a "pull-down" gesture on its content.
 *
 * @param {BottomSheetProps} props - The properties for the BottomSheet component.
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const isSheetOpen = Cell.source(false)
 *
 *   const toggleSheet = () => {
 *     isSheetOpen.set(!isSheetOpen.get())
 *   }
 *
 *   return (
 *     <>
 *       <button onClick={() => isSheetOpen.set(true)}>Open Sheet</button>
 *       <BottomSheet
 *         isOpen={isSheetOpen}
 *         onClose={toggleSheet}
 *       >
 *         {() => (
 *           <div>
 *             <h3>Sheet Content</h3>
 *             <p>This is some content inside the bottom sheet.</p>
 *             <button onClick={toggleSheet}>Close</button>
 *           </div>
 *         )}
 *       </BottomSheet>
 *     </>
 *   )
 * }
 * ```
 */
export function BottomSheet(props: BottomSheetProps) {
   const {
      isOpen: isOpenProp,
      ref: contentRef = Cell.source<HTMLElement | null>(null),
      children,
      onClose,
      ...rest
   } = props
   const observer = useObserver()
   const isOpen = useDerivedValue(isOpenProp)
   const dialogOpen = Cell.source(isOpen.get())
   const dialogRef = Cell.source<HTMLDialogElement | null>(null)

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
         // opening the sheet
         dialogOpen.set(isOpen)
         dialogElement?.show()
      } else if (!isOpen && dialogElement?.open) {
         // closing the sheet
         await startCloseSequence()
         dialogOpen.set(isOpen)
         dialogElement?.close()
      }
   }

   dialogRef.listen(() => {
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
               // The sheet's "pull" is CSS scroll, not translation.
               // To avoid a visual jump before animating out, this sets the content's `translateY`
               // to its current scrolled position, ensuring a smooth transition.
               const contentRectBeforeClose = content.getBoundingClientRect()
               const initialDistanceFromViewportTop =
                  window.innerHeight - contentRectBeforeClose.height
               const currentDistanceFromViewportTop = contentRectBeforeClose.y
               const distanceToTranslate =
                  currentDistanceFromViewportTop - initialDistanceFromViewportTop

               content.style.translate = `0px ${distanceToTranslate}px`

               onClose?.()
            }
         },
         () => {
            return {
               root: dialogRef.peek(),
               threshold: 0.3
            }
         }
      )

      observer.onConnected(dialogRef, async (dialog) => {
         handleIsOpenChange(isOpen.get())
         await animationsSettled(contentRef)
         dialog.classList.add(styles.snapped)
         dialog.scrollTo({ top: dialog.scrollHeight, behavior: 'instant' })
         defer(() => {
            // Omo idk. If either of the scrollTo() calls is
            // removed, the sheet content either glitches or doesn't scroll to the bottom.
            // Sometimes in Firefox, sometimes in Chromium (gasp), sometimes in Safari.
            dialog.scrollTo({ top: dialog.scrollHeight, behavior: 'instant' })
         })
      })
   })

   isOpen.listen(handleIsOpenChange)

   return If(dialogOpen, () => {
      return (
         <dialog
            ref={dialogRef}
            data-content-open={isOpen}
            class={styles.dialog}
            onClick--self={handleClickOutside}
         >
            <div {...rest} ref={contentRef} class={[styles.sheetContentContainer, rest.class]}>
               {children()}
            </div>
         </dialog>
      )
   })
}

/**
 * A bottom-aligned sheet component whose open state is controlled by a URL query parameter.
 *
 * This component wraps the `BottomSheet` and manages its `isOpen` and `onClose` props
 * based on the presence and value of a specified query parameter in the URL.
 *
 * When the query parameter specified by `queryKey` is present in the URL, the sheet
 * will be open. If a `value` is provided, the sheet will only open if the query
 * parameter's value matches the specified `value`.
 *
 * Closing the sheet (either via user interaction or calling `onClose`) will remove
 * the `queryKey` from the URL's query parameters.
 *
 * @param {QueryControlledBottomSheetProps} props - The properties for the QueryControlledBottomSheet component.
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   // To open this sheet, the URL would need to be something like:
 *   // /some/path?sheet=true
 *   return (
 *     <QueryControlledBottomSheet queryKey="sheet" value="true">
 *       {() => (
 *         <div>
 *           <h3>Query Controlled Sheet</h3>
 *           <p>This sheet opens when 'sheet=true' is in the URL.</p>
 *         </div>
 *       )}
 *     </QueryControlledBottomSheet>
 *   )
 * }
 *
 * const AnotherComponent = () => {
 *   // To open this sheet, the URL would need to be something like:
 *   // /another/path?myDialog
 *   // (No specific value required, just the presence of 'myDialog' key)
 *   return (
 *     <QueryControlledBottomSheet queryKey="myDialog">
 *       {() => (
 *         <div>
 *           <h3>Simple Query Controlled Sheet</h3>
 *           <p>This sheet opens when 'myDialog' is present in the URL.</p>
 *         </div>
 *       )}
 *     </QueryControlledBottomSheet>
 *   )
 * }
 * ```
 */
export function QueryControlledBottomSheet(props: QueryControlledBottomSheetProps) {
   const { queryKey, value: valueProp, children, ...rest } = props
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
      <BottomSheet isOpen={isOpen} onClose={onClose} {...rest}>
         {children}
      </BottomSheet>
   )
}
