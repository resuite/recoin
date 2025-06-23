import { animationsSettled } from '@/utilities/animations'
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

export const BottomDrawer = (props: BottomDrawerProps) => {
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

   const startCloseSequence = async () => {
      dialogRef.peek()?.classList.add(styles.closing)
      await animationsSettled(contentRef)
   }

   const handleClickOutside = async () => {
      await startCloseSequence()
      onClose?.()
   }

   const handleIsOpenChange = async (isOpen: boolean) => {
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
   const recurringAppendListener = () => {
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
               // @adebola-io(2025-06-22): The drawer's "pull" is CSS scroll, not translation.
               // To avoid a visual jump before animating out, this sets the content's `translateY`
               // to its current scrolled position, ensuring a smooth transition.
               const contentRectBeforeClose = content.getBoundingClientRect()
               const initialDistanceFromViewportTop =
                  window.innerHeight - content.offsetHeight
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

export const QueryControlledBottomDrawer = (
   props: QueryControlledBottomDrawerProps
) => {
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

   const onClose = () => {
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
