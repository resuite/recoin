import { Cell, createScope, useObserver, useScopeContext } from 'retend'
import type { JSX } from 'retend/jsx-runtime'
import { useIntersectionObserver } from 'retend-utils/hooks'
import { ScrollView, useScrollTimeline } from '@/components/views/scroll-view'
import styles from './sidebar-provider-view.module.css'

type DivProps = JSX.IntrinsicElements['div']

interface SidebarCtx {
   sidebarState: Cell<'open' | 'closed'>
   toggleSidebar: (force?: boolean) => void
   toggleSidebarEnabled: (value?: boolean) => void
}
const SidebarScope = createScope<SidebarCtx>('Sidebar')

export interface SidebarProviderViewProps extends DivProps {
   /**
    * Function that returns a JSX template for the sidebar content.
    * This will be rendered inside the sidebar container.
    */
   sidebar: () => JSX.Template
   ref?: Cell<HTMLElement | null>
   /**
    * Callback function that is invoked when the sidebar state changes.
    */
   onSidebarStateChange?: (state: 'open' | 'closed') => void
   /**
    * Function that returns a JSX template for the main content.
    * This will be rendered inside the main content container.
    */
   children: () => JSX.Template
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
 *             </div>
 *          )}
 *       </SidebarProviderView>
 *    );
 * }
 */
export function SidebarProviderView(props: SidebarProviderViewProps) {
   const {
      sidebar: Sidebar,
      children: Content,
      ref: providerRef = Cell.source<HTMLElement | null>(null),
      onSidebarStateChange,
      ...rest
   } = props
   const observer = useObserver()
   const allowReveal = Cell.source(true)
   const contentRef = Cell.source<HTMLElement | null>(null)
   const sidebarRef = Cell.source<HTMLElement | null>(null)
   const sidebarState = Cell.source<'open' | 'closed'>('closed')
   // const pullToRefreshContext = tryFn(() => usePullToRefreshContext())

   const sidebarOpened = Cell.derived(() => {
      return sidebarState.get() === 'open'
   })
   const sidebarNotRevealable = Cell.derived(() => {
      return allowReveal.get() === false
   })

   const toggleSidebar = (force?: boolean) => {
      if (force !== undefined) {
         sidebarState.set(force ? 'open' : 'closed')
      } else {
         sidebarState.set(sidebarState.get() === 'open' ? 'closed' : 'open')
      }
      const isOpen = sidebarState.get() === 'open'
      const provider = providerRef.get()
      if (provider) {
         const left = isOpen ? 0 : provider.scrollWidth
         provider.scrollTo({ left, behavior: 'auto' })
      }
   }

   const toggleSidebarEnabled = (value?: boolean) => {
      allowReveal.set(value ?? !allowReveal.get())
   }

   const handleProviderClick = () => {
      if (sidebarState.get() === 'open') {
         sidebarState.set('closed')
      }
   }

   const sidebarScopeData: SidebarCtx = {
      sidebarState,
      toggleSidebar,
      toggleSidebarEnabled
   }

   let isAlreadyRevealedFlag = false
   useIntersectionObserver(
      sidebarRef,
      ([entry]) => {
         isAlreadyRevealedFlag = entry.isIntersecting
         sidebarState.set(isAlreadyRevealedFlag ? 'open' : 'closed')
      },
      () => {
         return { root: providerRef.peek(), threshold: 0.9 }
      }
   )

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
      const provider = providerRef.peek()
      if (provider) {
         const left = isOpen ? 0 : provider.scrollWidth
         provider.scrollTo({ left, behavior: 'auto' })
      }
   })

   observer.onConnected(providerRef, (provider) => {
      provider.scrollTo({ left: provider.scrollWidth, behavior: 'instant' })
   })

   const ContentContainer = () => {
      const timeline = useScrollTimeline()
      timeline.add({
         target: contentRef,
         keyframes: { scale: ['0.95', '1'] }
      })

      return (
         <div ref={contentRef} data-opened={sidebarOpened} class={styles.content}>
            <Content />
         </div>
      )
   }

   return (
      <SidebarScope.Provider value={sidebarScopeData}>
         {() => (
            <ScrollView
               {...rest}
               axis='inline'
               ref={providerRef}
               data-not-revealable={sidebarNotRevealable}
               class={[styles.provider, rest.class]}
               showScrollBar={false}
               overscrollEffect={false}
               onClick--self={handleProviderClick}
            >
               {() => (
                  <>
                     <ContentContainer />
                     <div class={styles.sidebar} ref={sidebarRef}>
                        <Sidebar />
                     </div>
                  </>
               )}
            </ScrollView>
         )}
      </SidebarScope.Provider>
   )
}

export function useSidebarContext() {
   return useScopeContext(SidebarScope)
}
