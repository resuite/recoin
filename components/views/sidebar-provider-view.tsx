import { Browsers, currentBrowser } from '@/utilities/browser'
import { PointerTracker, type TrackedMoveEvent } from '@/utilities/pointer-gesture-tracker'
import { NEGLIGIBLE_SCROLL_PX, scrollTimelineFallback } from '@/utilities/scrolling'
import { Cell, createScope, useObserver, useScopeContext } from 'retend'
import { useDerivedValue, useIntersectionObserver } from 'retend-utils/hooks'
import type { JSX } from 'retend/jsx-runtime'
import { PullStartEvent } from './pull-to-refresh-view'
import styles from './sidebar-provider-view.module.css'

type DivProps = JSX.IntrinsicElements['div']

interface SidebarCtx {
   sidebarState: Cell<'open' | 'closed'>
   toggleSidebar: () => void
}
const SidebarScope = createScope<SidebarCtx>()

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
   /**
    * Function that returns a JSX template for the main content.
    * This will be rendered inside the main content container.
    */
   children?: () => JSX.Template
}

/**
 * A layout component that provides a two-panel view: a sidebar and a main content area.
 * It allows the sidebar to be revealed or hidden, typically by horizontal scrolling or programmatic control.
 *
 * The component exposes a `SidebarContext` which can be consumed by descendants using the `useSidebar` hook
 * to programmatically interact with the sidebar state (e.g., toggle, check current state)
 *
 * @example
 * function MyPage() {
 *    return (
 *       <SidebarProviderView
 *          sidebar={() => <div><h2>Sidebar Content</h2></div>}
 *          onSidebarStateChange={(state) => console.log('Sidebar is now:', state)}
 *       >
 *          {() => (
 *             <div>
 *                <h1>Main Page Content</h1>
 *                <p>This is the primary content area.</p>
 *             </div>
 *          )}
 *       </SidebarProviderView>
 *    );
 * }
 */
export function SidebarProviderView(props: SidebarProviderViewProps) {
   const {
      sidebar,
      children,
      ref: providerRef = Cell.source<HTMLElement | null>(null),
      allowReveal: allowRevealProp = Cell.source(true),
      onSidebarStateChange,
      ...rest
   } = props
   const observer = useObserver()
   const allowReveal = useDerivedValue(allowRevealProp)
   const contentRef = Cell.source<HTMLElement | null>(null)
   const sidebarRef = Cell.source<HTMLElement | null>(null)
   const sidebarState = Cell.source<'open' | 'closed'>('closed')

   const sidebarOpened = Cell.derived(() => {
      return sidebarState.get() === 'open'
   })
   const sidebarNotRevealable = Cell.derived(() => {
      return allowReveal.get() === false
   })

   const toggleSidebar = () => {
      sidebarState.set(sidebarState.get() === 'open' ? 'closed' : 'open')
   }

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

   const sidebarScopeData: SidebarCtx = {
      sidebarState,
      toggleSidebar
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
      () => {
         return { root: providerRef.peek(), threshold: 0.9 }
      }
   )

   observer.onConnected(providerRef, scrollTimelineFallback)

   observer.onConnected(providerRef, (provider) => {
      provider.scrollTo({ left: provider.scrollWidth, behavior: 'instant' })
      sidebarState.listen((state) => {
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
      // properly differentiated from y-axis pulls (handled by PullToRefreshView).
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
      <SidebarScope.Provider value={sidebarScopeData}>
         {() => {
            return (
               <div
                  {...rest}
                  ref={providerRef}
                  data-not-revealable={sidebarNotRevealable}
                  class={[styles.provider, rest.class]}
               >
                  <div class={styles.sidebar} ref={sidebarRef}>
                     {sidebar()}
                  </div>
                  <div ref={contentRef} data-opened={sidebarOpened} class={styles.content}>
                     {children?.()}
                  </div>
               </div>
            )
         }}
      </SidebarScope.Provider>
   )
}

export function useSidebar() {
   return useScopeContext(SidebarScope)
}
