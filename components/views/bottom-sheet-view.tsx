import { Cell, createScope, If, type SourceCell, useObserver, useScopeContext } from 'retend'
import type { JSX } from 'retend/jsx-runtime'
import { useRouteQuery } from 'retend/router'
import { Teleport } from 'retend/teleport'
import { useDerivedValue } from 'retend-utils/hooks'
import { animationsSettled } from '@/utilities/animations'
import styles from './bottom-sheet-view.module.css'

type DivProps = JSX.IntrinsicElements['div']

interface BottomSheetProps extends DivProps {
   isOpen: JSX.ValueOrCell<boolean>
   onClose?: () => void
   children: () => JSX.Template
   ref?: SourceCell<HTMLElement | null>
   dynamicSizing?: boolean
}

interface QueryControlledBottomSheetProps extends Omit<BottomSheetProps, 'isOpen'> {
   queryKey: string
   value?: JSX.ValueOrCell<string>
}

interface BottomSheetContext {
   contentRef: Cell<HTMLElement | null>
   resize(height: string): void
   resizeToContent(): void
   resizeToScreen(): void
   close(): void
}

const BottomSheetScope = createScope<BottomSheetContext>()

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
 *       <Button onClick={() => isSheetOpen.set(true)}>Open Sheet</Button >
 *       <BottomSheet
 *         isOpen={isSheetOpen}
 *         onClose={toggleSheet}
 *       >
 *         {() => (
 *           <div>
 *             <h3>Sheet Content</h3>
 *             <p>This is some content inside the bottom sheet.</p>
 *             <Button onClick={toggleSheet}>Close</Button >
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
      dynamicSizing,
      ...rest
   } = props
   const observer = useObserver()
   const isOpen = useDerivedValue(isOpenProp)
   const dialogOpen = Cell.source(isOpen.get())
   const dialogRef = Cell.source<HTMLDialogElement | null>(null)
   const sheetContentHeight = Cell.source(0)
   const sheetContentHeightStr = Cell.derived(() => {
      const height = sheetContentHeight.get()
      return height ? `${height}px` : '70dvh'
   })

   if (dynamicSizing) {
      contentRef.listen(() => {
         // The mechanics of the bottom sheet rely heavily on the content height.
         // This is not always possible to know ahead of time,
         // so we use a ResizeObserver to observe the content's height
         // and update accordingly.
         observer.onConnected(contentRef, async (content) => {
            await animationsSettled(content)
            sheetContentHeight.set(content.clientHeight)
            const resizeObserver = new ResizeObserver(([entry]) => {
               sheetContentHeight.set(entry.contentRect.height)
            })
            resizeObserver.observe(content)
            return () => {
               sheetContentHeight.set(0)
               resizeObserver.disconnect()
            }
         })
      })
   }
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
      } else if (!isOpen) {
         // closing the sheet
         if (!dialogElement?.classList.contains(styles.closing)) {
            await startCloseSequence()
         }
         dialogElement?.close()
         dialogOpen.set(isOpen)
      }
   }

   function resize(height: string) {
      const content = contentRef.get()
      if (!content) {
         return
      }
      content.style.height = height
   }

   function resizeToContent() {
      const content = contentRef.get()
      if (!content) {
         return
      }
      content.style.removeProperty('height')
   }

   function resizeToScreen() {
      resize('100dvh')
   }

   function close() {
      const dialogElement = dialogRef.get()
      if (!dialogElement) {
         return
      }
      dialogElement.close()
   }

   dialogRef.runAndListen(() => {
      // // The 'pull' behavior is created using scroll snaps, and the intersection
      // // observer checks that the user has pulled down a reasonable amount
      // // before closing.
      // useIntersectionObserver(
      //    contentRef,
      //    ([entry]) => {
      //       const shouldClose = !entry.isIntersecting && entry.intersectionRatio !== 0
      //       if (shouldClose) {
      //          const content = contentRef.get()
      //          if (!content) {
      //             return
      //          }
      //          // The sheet's "pull" is CSS scroll, not translation.
      //          // To avoid a visual jump before animating out, this sets the content's `translateY`
      //          // to its current scrolled position, ensuring a smooth transition.
      //          const contentRectBeforeClose = content.getBoundingClientRect()
      //          const initialDistanceFromViewportTop =
      //             window.innerHeight - contentRectBeforeClose.height
      //          const currentDistanceFromViewportTop = contentRectBeforeClose.y
      //          const distanceToTranslate =
      //             currentDistanceFromViewportTop - initialDistanceFromViewportTop
      //          content.style.translate = `0px ${distanceToTranslate}px`
      //          onClose?.()
      //       }
      //    },
      //    () => {
      //       return { root: dialogRef.peek(), threshold: 0.3 }
      //    }
      // )
   })

   isOpen.listen(handleIsOpenChange)

   const ctx: BottomSheetContext = {
      contentRef,
      resize,
      close,
      resizeToContent,
      resizeToScreen
   }

   return (
      <BottomSheetScope.Provider value={ctx}>
         {() => (
            <Teleport to='body'>
               {If(dialogOpen, () => (
                  <dialog
                     ref={dialogRef}
                     class={styles.dialog}
                     onClick--self={handleClickOutside}
                     data-dynamic-sizing={dynamicSizing}
                     onClose={onClose}
                     style={{ '--sheet-content-height': sheetContentHeightStr }}
                  >
                     <div
                        {...rest}
                        ref={contentRef}
                        class={[styles.sheetContentContainer, rest.class]}
                     >
                        {If(dynamicSizing, () => (
                           <AnimatedBackground
                              class={styles.sheetContentContainerBackground}
                              height={sheetContentHeight}
                           />
                        ))}
                        {children()}
                     </div>
                  </dialog>
               ))}
            </Teleport>
         )}
      </BottomSheetScope.Provider>
   )
}

interface AnimatedBackgroundProps extends DivProps {
   height: JSX.ValueOrCell<number>
   ref?: Cell<HTMLElement | null>
}

function AnimatedBackground(props: AnimatedBackgroundProps) {
   const { height: heightProp, ref = Cell.source(null), ...rest } = props
   const height = useDerivedValue(heightProp)
   let initialHeight: number | undefined

   let lastAfterPseudoElementTranslation = '1'
   let lastBeforePseudoTranslation = '0px'

   const updateHeight = (nextHeight: number) => {
      const div = ref.get()
      if (div === null) {
         return
      }

      if (initialHeight === undefined) {
         initialHeight = nextHeight
         if (div.attributeStyleMap) {
            div.attributeStyleMap.set('height', CSS.px(initialHeight))
         } else {
            div.style.height = `${initialHeight}`
         }
      } else {
         lastBeforePseudoTranslation = `0 ${initialHeight - nextHeight + 1}px`
         lastAfterPseudoElementTranslation = `1 ${nextHeight / initialHeight}`
         div.animate([{ translate: lastBeforePseudoTranslation }], {
            pseudoElement: ':before',
            duration: 300,
            easing: 'cubic-bezier(0.3, 0.4, 0.05, 1)',
            fill: 'forwards'
         })
         div.animate([{ scale: lastAfterPseudoElementTranslation }], {
            pseudoElement: ':after',
            duration: 300,
            easing: 'cubic-bezier(0.3, 0.4, 0.05, 1)',
            fill: 'forwards'
         })
      }
   }

   height.listen(updateHeight)

   return <div {...rest} ref={ref} />
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

export function useBottomSheetContext() {
   return useScopeContext(BottomSheetScope)
}
