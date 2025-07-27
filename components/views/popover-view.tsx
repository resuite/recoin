import { type Split, clamp } from '@/utilities/miscellaneous'
import { Cell, If, type SourceCell, useObserver } from 'retend'
import { useDerivedValue, useElementBounding, useWindowSize } from 'retend-utils/hooks'
import type { JSX } from 'retend/jsx-runtime'
import styles from './popover-view.module.css'

type DivProps = JSX.IntrinsicElements['div']
export type PositionArea =
   | 'top left'
   | 'top right'
   | 'top center'
   | 'bottom left'
   | 'bottom right'
   | 'bottom center'
   | 'center left'
   | 'center right'
   | 'center center'
export type Alignment = 'start' | 'end'

export interface BasePopoverProps extends DivProps {
   /**
    * An optional `SourceCell` to capture a reference to the popover's root HTML element.
    */
   ref?: SourceCell<HTMLElement | null>
   /**
    * A function that returns the JSX template for the content to be displayed
    * inside the popover.
    */
   children: JSX.ValueOrCell<() => JSX.Template>
   /**
    * A reactive boolean that controls the visibility of the popover.
    * When `true`, the popover is rendered; when `false`, it is not.
    */
   isOpen: JSX.ValueOrCell<boolean>
}

export interface UnanchoredPopoverProps extends BasePopoverProps {
   x: JSX.ValueOrCell<number>
   y: JSX.ValueOrCell<number>
}

/**
 * Props for the PopoverView component.
 */
export interface AnchoredPopoverProps extends BasePopoverProps {
   /**
    * A `SourceCell` that holds a reference to the anchor element. The popover's
    * position will be calculated relative to this element.
    */
   anchorRef: SourceCell<HTMLElement | null>
   /**
    * Defines where the popover should appear relative to the anchor element, in a
    * 3x3 grid, where the anchor is in the center.
    *
    * It supports a subset of the allowed values for the `position-area` CSS property.
    *
    * @default 'top center'
    */
   positionArea?: JSX.ValueOrCell<PositionArea>
   /**
    * Optional prop to control the horizontal alignment of the popover relative to its anchor element.
    */
   justifySelf?: JSX.ValueOrCell<Alignment | undefined>
   alignSelf?: JSX.ValueOrCell<Alignment | undefined>
}

export type PopoverProps = AnchoredPopoverProps | UnanchoredPopoverProps

/**
 * A flexible UI component for displaying content in a floating popover,
 * positioned relative to an anchor element.
 *
 * @param {PopoverProps} props - The props for the PopoverView component.
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const popoverIsOpen = Cell.source(false);
 *   const anchorRef = Cell.source<HTMLButtonElement | null>(null);
 *
 *   const togglePopover = () => {
 *     popoverIsOpen.set(!popoverIsOpen.get());
 *   };
 *
 *   return (
 *     <div>
 *       <button ref={anchorRef} onClick={togglePopover}>
 *         Open Popover
 *       </button>
 *       <PopoverView
 *         isOpen={popoverIsOpen}
 *         anchorRef={anchorRef}
 *         positionArea="bottom center"
 *         justifySelf="end"
 *         class="bg-white shadow-lg rounded-md"
 *       >
 *         {() => (
 *           <div class="p-2">
 *             <p>This is the popover content.</p>
 *             <button type="button" onClick={togglePopover}>Close</button>
 *           </div>
 *         )}
 *       </PopoverView>
 *     </div>
 *   );
 * }
 * ```
 */
export function PopoverView(props: PopoverProps) {
   const {
      positionArea: positionAreaProp = 'top center',
      justifySelf: justifySelfProp = undefined,
      alignSelf: alignSelfProp = undefined,
      anchorRef,
      children,
      x: xProp,
      y: yProp,
      isOpen: isOpenProp,
      ref = Cell.source<HTMLElement | null>(null),
      ...rest
   } = props as AnchoredPopoverProps & UnanchoredPopoverProps

   // TODO: retend-utils/hooks should have a `useCssSupports()` hook.
   const usingAnchorPositioning = Cell.source<boolean | null>(null)
   const isOpen = useDerivedValue(isOpenProp)
   const positionArea = useDerivedValue(positionAreaProp)
   const justifySelf = useDerivedValue(justifySelfProp)
   const alignSelf = useDerivedValue(alignSelfProp)
   const observer = useObserver()
   const anchorName = Cell.source('none')
   const x = useDerivedValue(xProp)
   const y = useDerivedValue(yProp)

   const containerStyles: Cell<JSX.StyleValue> = Cell.derived(() => {
      const anchoringSupported = usingAnchorPositioning.get()
      if (anchoringSupported === null) {
         return {}
      }

      if (x.get() !== undefined && y.get() !== undefined) {
         return { top: `${y.get()}px`, left: `${x.get()}px` }
      }

      if (anchoringSupported) {
         const positionAnchor = anchorName.get()
         return {
            positionAnchor,
            positionArea,
            justifySelf: Cell.derived(() => {
               return justifySelf.get() ?? 'unset'
            }),
            alignSelf: Cell.derived(() => {
               return alignSelf.get() ?? 'unset'
            })
         }
      }

      const pArea = positionArea.get()
      const jSelf = justifySelf.get()
      const aSelf = alignSelf.get()

      if (anchorRef) {
         return { ...computePosition(pArea, anchorRef, ref, jSelf, aSelf) }
      }
   })

   const assignAnchorName = (anchor: HTMLElement) => {
      const newAnchorName = anchor.dataset.anchorName || generateNewAnchorName()
      anchor.dataset.anchorName = newAnchorName
      anchor.style.setProperty('anchor-name', newAnchorName)
      anchorName.set(newAnchorName)
   }

   if (anchorRef) {
      observer.onConnected(anchorRef, (anchor) => {
         const anchoringSupported =
            CSS.supports?.('position-area: top left') &&
            CSS.supports('anchor-name: --name')
         if (anchoringSupported) {
            assignAnchorName(anchor)
         }
         usingAnchorPositioning.set(anchoringSupported)
      })
   } else {
      usingAnchorPositioning.set(false)
   }

   return If(isOpen, () => {
      return (
         <div
            {...rest}
            ref={ref}
            style={containerStyles}
            class={[styles.popoverViewContainer, rest.class]}
         >
            {If(children, (c) => {
               return c()
            })}
         </div>
      )
   })
}

function generateNewAnchorName() {
   const randomId = crypto.randomUUID().replace(/-/g, '').slice(0, 8)
   return `--anchor-${randomId}`
}

function computePosition(
   positionArea: PositionArea,
   anchorRef: SourceCell<HTMLElement | null>,
   popoverRef: SourceCell<HTMLElement | null>,
   justifySelf: Alignment | undefined,
   alignSelf: Alignment | undefined
) {
   let top: Cell<number> | undefined
   let left: Cell<number> | undefined
   let bottom: Cell<number> | undefined
   let right: Cell<number> | undefined

   const rect = useElementBounding(anchorRef)
   const popoverRect = useElementBounding(popoverRef)
   const { width: vw, height: vh } = useWindowSize()
   const [areaY, areaX] = positionArea.split(' ') as Split<PositionArea, ' '>

   const anchorWidth = Cell.derived(() => {
      return `${rect.width.get()}px`
   })
   const anchorHeight = Cell.derived(() => {
      return `${rect.height.get()}px`
   })

   // Compute Vertical Position
   if (areaY === 'top') {
      bottom = Cell.derived(() => {
         return vh.get() - rect.top.get()
      })
   } else if (areaY === 'bottom') {
      top = Cell.derived(() => {
         return rect.bottom.get()
      })
   } else if (areaY === 'center') {
      if (alignSelf === 'start') {
         top = Cell.derived(() => {
            return rect.top.get()
         })
      } else if (alignSelf === 'end') {
         bottom = Cell.derived(() => {
            return vh.get() - rect.bottom.get()
         })
      } else {
         top = Cell.derived(() => {
            const anchorHeight = rect.height.get()
            const popoverHeight = popoverRect.height.get()
            const offset = Math.abs(anchorHeight - popoverHeight) / 2
            const anchorTallerThanPopover =
               Math.max(anchorHeight, popoverHeight) === anchorHeight
            return rect.top.get() + (anchorTallerThanPopover ? offset : -offset)
         })
      }
   }

   // Compute Horizontal Position
   if (areaX === 'left') {
      right = Cell.derived(() => {
         return vw.get() - rect.left.get()
      })
   } else if (areaX === 'right') {
      left = Cell.derived(() => {
         return rect.right.get()
      })
   } else if (areaX === 'center') {
      if (justifySelf === 'start') {
         left = Cell.derived(() => {
            return rect.left.get()
         })
      } else if (justifySelf === 'end') {
         right = Cell.derived(() => {
            return vw.get() - rect.right.get()
         })
      } else {
         left = Cell.derived(() => {
            const anchorWidth = rect.width.get()
            const popoverWidth = popoverRect.width.get()
            const offset = Math.abs(anchorWidth - popoverWidth) / 2
            const anchorWiderThanPopover =
               Math.max(anchorWidth, popoverWidth) === anchorWidth
            return rect.left.get() + (anchorWiderThanPopover ? offset : -offset)
         })
      }
   }

   const maxY = Cell.derived(() => {
      return vh.get() - popoverRect.height.get()
   })

   const maxX = Cell.derived(() => {
      return vw.get() - popoverRect.width.get()
   })

   return {
      top: Cell.derived(() => {
         return top ? `${clamp(top.get(), 0, maxY.get())}px` : 'auto'
      }),
      left: Cell.derived(() => {
         return left ? `${clamp(left.get(), 0, maxX.get())}px` : 'auto'
      }),
      bottom: Cell.derived(() => {
         return bottom ? `${clamp(bottom.get(), 0, maxY.get())}px` : 'auto'
      }),
      right: Cell.derived(() => {
         return right ? `${clamp(right.get(), 0, maxX.get())}px` : 'auto'
      }),

      '--anchor-width': anchorWidth,
      '--anchor-height': anchorHeight
   }
}
