import { Icon } from '@/components/icons'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import { ExpandingView, usePullToRefreshContext, useSidebarContext } from '@/components/views'
import { vibrate } from '@/utilities/miscellaneous'
import { Cell } from 'retend'

const FloatingActionButtonTest = (props?: { children?: unknown; class?: string }) => {
   const isOpen = Cell.source(false)
   try {
      const sidebarCtx = useSidebarContext()
      const pullToRefreshCtx = usePullToRefreshContext()
      isOpen.listen((viewIsOpen) => {
         sidebarCtx.toggleSidebarEnabled(!viewIsOpen)
         pullToRefreshCtx.togglePullToRefreshEnabled(!viewIsOpen)
      })
   } catch {}
   const buttonsOpened = Cell.source(false)
   const buttonsClosed = Cell.derived(() => {
      return !buttonsOpened.get()
   })

   const toggleOpenState = () => {
      vibrate()
      isOpen.set(!isOpen.get())
      if (!isOpen.get()) {
         buttonsOpened.set(false)
      }
   }

   const toggleButtonState = () => {
      buttonsOpened.set(!buttonsOpened.get())
   }

   return (
      <div data-expanded-ctx={isOpen} class='h-screen w-screen overflow-hidden grid relative'>
         <div
            class={[
               'rounded-t-3xl text-bigger h-full w-full grid place-items-center [grid-area:1/1]',
               'ease-in-out duration-bit-slower transition-[translate,scale,opacity] translate-y-0 delay-fast',
               'expanded-ctx:translate-y-[5%] expanded-ctx:scale-[.97] expanded-ctx:opacity-50 expanded-ctx:delay-0',
               props?.class
            ]}
         >
            {props?.children}
         </div>
         <FloatingActionButton
            disabled={buttonsClosed}
            class={[
               'grid place-items-center',
               'transition-transform ease-in-out scale-[0.85] absolute',
               {
                  'opacity-0 [transition:translate_var(--default-speed),opacity_0.5ms_var(--default-speed)]':
                     buttonsClosed,
                  'translate-x-[51%]': buttonsOpened
               }
            ]}
         >
            <Icon name='arrows' class='-rotate-135' />
         </FloatingActionButton>
         <FloatingActionButton
            onClick={toggleOpenState}
            class={[
               'grid place-items-center',
               'border-b-2 border-light-yellow',
               'expanded-ctx:dark-scheme expanded-ctx:scale-[0.85] expanded-ctx:bg-canvas expanded-ctx:rotate-[225deg] expanded-ctx:border-none',
               '[transition:rotate_var(--speed-slower)_var(--timing-bounce-slower)_var(--rotate-delay,0ms),scale_var(--default-speed),translate_var(--default-speed)] ease-in-out',
               '[--rotate-delay:var(--speed-default)]',
               {
                  '-translate-x-[51%]': buttonsOpened,
                  'scale-[calc(1-var(--sidebar-reveal))]': buttonsClosed
               }
            ]}
         >
            <Icon name='add' />
         </FloatingActionButton>
         <ExpandingView
            expandColor='var(--color-base)'
            expandOrigin='auto auto calc(var(--spacing) * 3) calc(50% - var(--fab-size) / 2)'
            class='dark-scheme h-screen w-screen grid place-items-center place-content-center gap-1 [grid-area:1/1]'
            isOpen={isOpen}
         >
            {() => (
               <>
                  <div class='after:block after:h-0.15 after:bg-canvas-text after:animate-lining overflow-hidden'>
                     <div class='text-title animate-fade-in animate-delay-bit-slower'>
                        hello recoin!
                     </div>
                  </div>
                  <button
                     type='button'
                     class='animate-fade-in animate-delay-bit-slower'
                     onClick={toggleButtonState}
                  >
                     Toggle Button state.
                  </button>
               </>
            )}
         </ExpandingView>
      </div>
   )
}

export default FloatingActionButtonTest
