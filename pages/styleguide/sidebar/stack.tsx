import { Icon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import {
   type KeyboardVisibilityEvent,
   StackView,
   StackViewGroup,
   VirtualKeyboardAwareView,
   VirtualKeyboardTriggers,
   useSidebarContext
} from '@/components/views'
import { Cell, useScopeContext } from 'retend'
import FloatingActionButtonTest from '../fab'
import { Scope } from './scope'

function FirstPage() {
   const { page2IsOpen, openSheet } = useScopeContext(Scope)
   const { toggleSidebar } = useSidebarContext()

   const toggleSecondPage = () => {
      page2IsOpen.set(!page2IsOpen.get())
   }

   return (
      <StackView class='bg-sky-300' root>
         {() => (
            <FloatingActionButtonTest class='h-full w-full relative grid place-items-center place-content-center gap-0.5'>
               <h1 class='text-header'>recoin.</h1>
               <Button type='button' onClick={toggleSidebar}>
                  Toggle Sidebar
               </Button>
               <Button type='button' onClick={openSheet}>
                  Open Bottom Sheet
               </Button>
               <Button type='button' onClick={toggleSecondPage}>
                  Next Page
                  <Icon name='caret' direction='right' class='btn-icon' />
               </Button>
            </FloatingActionButtonTest>
         )}
      </StackView>
   )
}

function SecondPage() {
   const { page2IsOpen, page3IsOpen } = useScopeContext(Scope)

   const toggleSecondPage = () => {
      page2IsOpen.set(!page2IsOpen.get())
   }

   const toggleThirdPage = () => {
      page3IsOpen.set(!page3IsOpen.get())
   }

   const translate = Cell.source('none')
   const keyboardIsVisible = Cell.source(false)
   const keyboardIsClosed = Cell.derived(() => {
      return !keyboardIsVisible.get()
   })
   const handleVisibilityChange = (event: KeyboardVisibilityEvent) => {
      translate.set(`0px -${event.approximateHeight}px`)
      keyboardIsVisible.set(event.isVisible)
   }

   return (
      <StackView isOpen={page2IsOpen} onCloseRequested={toggleSecondPage}>
         {() => (
            <VirtualKeyboardAwareView
               class='w-full h-full grid gap-0.5 p-1'
               onKeyboardVisibilityChange={handleVisibilityChange}
            >
               {() => (
                  <div class='grid place-items-center grid-rows-[1fr_auto]'>
                     <div
                        class={[
                           'grid place-items-center duration-default transition-[scale,opacity]',
                           {
                              'opacity-0 scale-90 delay-0': keyboardIsVisible,
                              'delay-default': keyboardIsClosed
                           }
                        ]}
                     >
                        <h2 class='text-large'>2</h2>
                        <p>Second page.</p>
                        <br />
                        <Button type='button' onClick={toggleSecondPage}>
                           <Icon name='caret' direction='left' class='btn-icon' />
                           Go back to page 1
                        </Button>
                        <Button type='button' onClick={toggleThirdPage}>
                           Next Page
                           <Icon name='caret' direction='right' class='btn-icon' />
                        </Button>
                     </div>
                     <VirtualKeyboardTriggers class='w-full text-big place-self-end'>
                        <input
                           class='duration-slow will-change-transform px-0.25'
                           type='text'
                           placeholder='Enter text'
                           style={{ translate }}
                        />
                     </VirtualKeyboardTriggers>
                  </div>
               )}
            </VirtualKeyboardAwareView>
         )}
      </StackView>
   )
}

function ThirdPage() {
   const { page3IsOpen, page4IsOpen } = useScopeContext(Scope)

   const toggleThirdPage = () => {
      page3IsOpen.set(!page3IsOpen.get())
   }

   const toggleFourthPage = () => {
      page4IsOpen.set(!page4IsOpen.get())
   }

   return (
      <StackView isOpen={page3IsOpen} onCloseRequested={toggleThirdPage}>
         {() => (
            <div class='w-full h-full grid place-items-center gap-0.5 place-content-center p-0.5'>
               <div class='mb-2 text-large'>3</div>
               <Button type='button' onClick={toggleThirdPage}>
                  <Icon name='caret' direction='left' class='btn-icon' />
                  Go back to page 2
               </Button>
               <Button type='button' onClick={toggleFourthPage}>
                  Next Page
                  <Icon name='caret' direction='right' class='btn-icon' />
               </Button>
            </div>
         )}
      </StackView>
   )
}

function FourthPage() {
   const { page4IsOpen } = useScopeContext(Scope)

   const toggleFourthPage = () => {
      page4IsOpen.set(!page4IsOpen.get())
   }

   return (
      <StackView isOpen={page4IsOpen} onCloseRequested={toggleFourthPage}>
         {() => (
            <div class='w-full h-full grid place-items-center gap-0.5 place-content-center p-0.5'>
               <div class='mb-2 text-large'>4</div>
               <Button type='button' onClick={toggleFourthPage}>
                  <Icon name='caret' direction='left' class='btn-icon' />
                  Go back to page 3
               </Button>
            </div>
         )}
      </StackView>
   )
}

export function StackTest() {
   return (
      <StackViewGroup class='h-full w-full light-scheme rounded-t-3xl'>
         <FirstPage />
         <SecondPage />
         <ThirdPage />
         <FourthPage />
      </StackViewGroup>
   )
}
