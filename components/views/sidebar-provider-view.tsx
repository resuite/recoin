import { Browsers, currentBrowser } from '@/utilities/browser'
import {
   PointerTracker,
   type TrackedMoveEvent
} from '@/utilities/pointer-gesture-tracker'
import {
   NEGLIGIBLE_SCROLL_PX,
   scrollTimelineFallback
} from '@/utilities/scrolling'
import { Cell, useObserver } from 'retend'
import { useDerivedValue, useIntersectionObserver } from 'retend-utils/hooks'
import type { JSX } from 'retend/jsx-runtime'
import { PullStartEvent } from './pull-to-refresh-view'
import styles from './sidebar-provider-view.module.css'

type DivProps = JSX.IntrinsicElements['div']
type ButtonProps = JSX.IntrinsicElements['button']

export interface SidebarProviderViewProps extends DivProps {
   /**
    * Function that returns a JSX template for the sidebar content.
    * This will be rendered inside the sidebar container.
    */
   sidebar: () => JSX.Template
   ref?: Cell<HTMLElement | null>
   /**
    * An external Cell to hold whether it should be
    * possible to reveal the sidebar.
    */
   allowReveal?: JSX.ValueOrCell<boolean>
   /**
    * Callback function that is invoked when the sidebar state changes.
    */
   onSidebarStateChange?: (state: 'open' | 'closed') => void
}

export interface SidebarToggleProps extends ButtonProps {}

/**
 * Creates a sidebar component with toggle functionality.
 *
 * This hook provides:
 * - A Cell to track sidebar open/closed state
 * - A SidebarProviderView component that renders the sidebar and content
 * - A SidebarToggle component to toggle the sidebar state
 *
 * The sidebar can be conditionally revealed based on an external allowReveal prop.
 * When open, the main content is disabled with pointer-events-none.
 * Includes smooth scrolling and intersection observer for sidebar visibility.
 *
 * @returns An object containing:
 *   - sidebarState: Mutable cell tracking open/closed state
 *   - SidebarProviderView: Component to wrap sidebar and content
 *   - SidebarToggle: Button component to toggle sidebar
 */
export function useSidebar() {
   const sidebarState = Cell.source<'open' | 'closed'>('closed')

   function toggleSidebar() {
      sidebarState.set(sidebarState.get() === 'open' ? 'closed' : 'open')
   }

   function SidebarProviderView(props: SidebarProviderViewProps) {
      const {
         sidebar,
         children,
         ref: providerRef = Cell.source<HTMLElement | null>(null),
         allowReveal: allowRevealProp = Cell.source(true),
         onSidebarStateChange,
         ...rest
      } = props
      const contentRef = Cell.source<HTMLElement | null>(null)
      const sidebarRef = Cell.source<HTMLElement | null>(null)
      const observer = useObserver()
      const sidebarOpened = Cell.derived(() => {
         return sidebarState.get() === 'open'
      })
      const allowReveal = useDerivedValue(allowRevealProp)
      const sidebarNotRevealable = Cell.derived(() => {
         return allowReveal.get() === false
      })

      const interceptPointerDown = (event: PointerEvent) => {
         event.stopPropagation()
         const tracker = new PointerTracker()
         tracker.start(event)

         const checkForPullStart = (event: TrackedMoveEvent) => {
            if (event.deltaY > NEGLIGIBLE_SCROLL_PX) {
               const provider = providerRef.get()
               tracker.removeEventListener('move', checkForPullStart)
               provider?.dispatchEvent(new PullStartEvent(tracker))
            }
         }

         tracker.addEventListener('move', checkForPullStart)
      }

      let isAlreadyRevealedFlag = false
      useIntersectionObserver(
         sidebarRef,
         ([entry]) => {
            if (entry === undefined) {
               return
            }
            isAlreadyRevealedFlag = entry.isIntersecting
            sidebarState.set(isAlreadyRevealedFlag ? 'open' : 'closed')
         },
         () => ({ root: providerRef.peek(), threshold: 0.9 })
      )

      observer.onConnected(sidebarRef, (sidebar) => {
         requestAnimationFrame(() => {
            // When the component loads without JS in prerender mode,
            // The content needs to be the initial scroll-snapped view.
            // Adding the sidebar scroll-snap only after the content is loaded
            // ensures that.
            sidebar.classList.add(styles.sidebar as string)
            requestAnimationFrame(() => {
               const provider = providerRef.get()
               if (provider) {
                  provider.scrollTo({
                     left: provider.scrollWidth,
                     behavior: 'instant'
                  })
               }
            })
         })
      })

      observer.onConnected(providerRef, scrollTimelineFallback)

      observer.onConnected(providerRef, () => {
         return sidebarState.listen((state) => {
            const isOpen = state === 'open'
            const isClosed = state === 'closed'
            if (isOpen && isAlreadyRevealedFlag) {
               return
            }
            if (isClosed && !isAlreadyRevealedFlag) {
               return
            }
            onSidebarStateChange?.(state)
            const target = isOpen ? sidebarRef.get() : contentRef.get()
            target?.scrollIntoView({ behavior: 'smooth', inline: 'start' })
         })
      })

      observer.onConnected(providerRef, async (provider) => {
         // Safari is a rubbish browser, and in it `touch-action: pan-x`
         // does not properly prevent vertical pointermoves. Thus,
         // x-axis swipe-scrolls intended for SidebarProviderView are not
         // properly differentiated from y-axis pulls (handled by PullToRefreshView)
         //
         // To work around this, we intercept the `pointerdown` event, and
         // by analyzing the initial gesture direction, we can manually distinguish
         // between horizontal (for opening/closing the sidebar) and vertical
         // (for triggering pull-to-refresh).
         const browser = currentBrowser()
         if (browser.getBrowserName() !== Browsers.Safari) {
            return
         }
         provider.addEventListener('pointerdown', interceptPointerDown)

         return () => {
            provider.removeEventListener('pointerdown', interceptPointerDown)
         }
      })

      return (
         <div
            {...rest}
            ref={providerRef}
            data-not-revealable={sidebarNotRevealable}
            class={[styles.provider, rest.class]}
         >
            <div ref={sidebarRef}>{sidebar()}</div>
            <div
               ref={contentRef}
               data-opened={sidebarOpened}
               class={styles.content}
            >
               {children}
            </div>
         </div>
      )
   }

   function SidebarToggle(props: SidebarToggleProps) {
      return (
         <button {...props} type='button' onClick={toggleSidebar}>
            {props.children}
         </button>
      )
   }

   return { sidebarState, SidebarProviderView, SidebarToggle }
}
