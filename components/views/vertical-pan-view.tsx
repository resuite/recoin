import { animationsSettled, timeout } from '@/utilities/animations'
import { Cell, If, createScope, useScopeContext } from 'retend'
import type { JSX } from 'retend/jsx-runtime'
import styles from './vertical-pan-view.module.css'

type DivProps = JSX.IntrinsicElements['div']
interface VerticalPanViewProps extends DivProps {
   children: () => JSX.Template
}

export interface VerticalPanContext {
   open: (template: () => JSX.Template) => void
   close: () => void
}

const VerticalPanScope = createScope<VerticalPanContext>()

/**
 * `VerticalPanView` is a layout component that enables a collapsible vertical panel
 * to overlay the main content. It's ideal for displaying supplementary information
 * or actions that can be revealed or hidden on demand.
 *
 * Use the `useVerticalPanContext` hook to access functions for opening and closing
 * the vertical panel, providing the content to be displayed when it's open.
 *
 * @example
 * ```tsx
 * import { VerticalPanView, useVerticalPanContext } from './vertical-pan-view';
 *
 * function ContentWithPanel() {
 *   return (
 *     <VerticalPanView>
 *       {() => {
 *         // useVerticalPanContext can only be called inside VerticalPanView
 *         const { open, close } = useVerticalPanContext();
 *
 *         const handleOpenPanel = () => {
 *           open(() => (
 *             <div>
 *               <h2>Panel Content</h2>
 *               <button onClick={close}>Close Panel</button>
 *             </div>
 *           ));
 *         };
 *
 *         return (
 *           <div>
 *             <h1>Main Content</h1>
 *             <button onClick={handleOpenPanel}>Open Panel</button>
 *           </div>
 *         );
 *       }}
 *     </VerticalPanView>
 *   );
 * }
 * ```
 *
 * @returns A JSX template that renders the vertical pan view.
 */
export function VerticalPanView(props: VerticalPanViewProps) {
   const { children, class: className, ...rest } = props
   const panContent = Cell.source<null | (() => JSX.Template)>(null)
   const mainContentRef = Cell.source<HTMLElement | null>(null)

   const ctx: VerticalPanContext = {
      async open(fn) {
         const mainContent = mainContentRef.get()
         if (!mainContent) {
            return
         }
         mainContent.classList.add(styles.hiding)
         await Promise.race([
            animationsSettled(mainContent).then(() =>
               mainContent.classList.add(styles.mainContentHidden)
            ),
            timeout(200)
         ])
         panContent.set(fn)
      },
      async close() {
         const mainContent = mainContentRef.get()
         if (!mainContent) {
            return
         }
         mainContent.classList.remove(styles.hiding, styles.mainContentHidden)
         await animationsSettled(mainContent)
         panContent.set(null)
      }
   }

   return (
      <VerticalPanScope.Provider value={ctx}>
         {() => (
            <div class={[styles.container, className]} {...rest}>
               {If(panContent, (content) => (
                  <div class={styles.hiddenSpace}>{content()}</div>
               ))}
               <div ref={mainContentRef} class={styles.mainContent}>
                  {children()}
               </div>
            </div>
         )}
      </VerticalPanScope.Provider>
   )
}

export function useVerticalPanContext() {
   return useScopeContext(VerticalPanScope)
}
