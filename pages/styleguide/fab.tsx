import { Icon } from '@/components/icons';
import { FloatingActionButton } from '@/components/ui';
import { ExpandingView } from '@/components/views';
import { Cell } from 'retend';

const FloatingActionButtonTest = (props?: { children?: unknown }) => {
   const isOpen = Cell.source(false);
   const buttonsOpened = Cell.source(false);
   const buttonsClosed = Cell.derived(() => !buttonsOpened.get());

   const toggleOpenState = () => {
      navigator.vibrate?.([15, 15]);
      isOpen.set(!isOpen.get());
      if (!isOpen.get()) {
         buttonsOpened.set(false);
      }
   };

   const toggleButtonState = () => {
      buttonsOpened.set(!buttonsOpened.get());
   };

   return (
      <div
         data-expanded-ctx={isOpen}
         class='h-screen w-screen rounded-t-4xl overflow-hidden grid relative'
      >
         <div
            class={[
               'light-scheme rounded-t-4xl text-bigger h-full w-full grid place-items-center [grid-area:1/1]',
               'ease-in-out duration-bit-slower transition-[translate,scale,opacity] translate-y-0 delay-fast',
               'expanded-ctx:translate-y-[3%] expanded-ctx:scale-[.97] expanded-ctx:opacity-50 expanded-ctx:delay-0',
            ]}
         >
            {props?.children}
         </div>
         <FloatingActionButton
            outlined={true}
            disabled={buttonsClosed}
            class={[
               'dark-scheme transition-transform ease-in-out scale-[0.85] absolute',
               {
                  'opacity-0 [transition:translate_var(--default-speed),opacity_0.5ms_var(--default-speed)]':
                     buttonsClosed,
                  'translate-x-[51%]': buttonsOpened,
               },
            ]}
         >
            <Icon name='arrows' class='-rotate-135' />
         </FloatingActionButton>
         <FloatingActionButton
            onClick={toggleOpenState}
            class={[
               'dark-scheme border-b-2 border-light-yellow',
               'expanded-ctx:light-scheme expanded-ctx:scale-[0.85] expanded-ctx:bg-canvas expanded-ctx:rotate-[225deg] expanded-ctx:border-none',
               '[transition:rotate_var(--speed-slower)_var(--rotate-delay,0ms),scale_var(--default-speed),translate_var(--default-speed)] ease-in-out',
               '[--rotate-delay:var(--speed-default)]',
               {
                  '-translate-x-[51%]': buttonsOpened,
                  'scale-[calc(1-var(--sidebar-reveal))]': buttonsClosed,
               },
            ]}
         >
            <Icon name='add' />
         </FloatingActionButton>
         <ExpandingView
            expandOrigin='auto auto calc(var(--spacing) * 3) calc(50% - var(--fab-size) / 2)'
            class='dark-scheme h-full w-full grid place-items-center place-content-center gap-1 [grid-area:1/1]'
            isOpen={isOpen}
            content={() => (
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
         />
      </div>
   );
};

export default FloatingActionButtonTest;
