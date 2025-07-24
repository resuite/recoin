import { Icon } from '@/components/icons'
import { StackView, StackViewGroup } from '@/components/views'
import { Cell } from 'retend'

const page2IsOpen = Cell.source(false)
const page3IsOpen = Cell.source(false)

function openPage2() {
   page2IsOpen.set(true)
}

function openPage3() {
   page3IsOpen.set(true)
}

function closePage2() {
   page2IsOpen.set(false)
}

function closePage3() {
   page3IsOpen.set(false)
}

function NavStack() {
   return (
      <div class='w-full rounded-t-3xl light-scheme overflow-hidden'>
         <StackViewGroup class='h-screen text-large'>
            <StackView root>
               {() => (
                  <div class='w-full h-full grid place-items-center gap-0.5 place-content-center p-0.5'>
                     <div class='mb-2'>1</div>
                     <button type='button' onClick={openPage2}>
                        Next Page
                        <Icon name='caret' direction='right' class='btn-icon' />
                     </button>
                  </div>
               )}
            </StackView>
            <StackView isOpen={page2IsOpen} onCloseRequested={closePage2}>
               {() => (
                  <div class='w-full h-full grid place-items-center gap-0.5 place-content-center p-0.5'>
                     <div class='mb-2'>2</div>
                     <button type='button' onClick={closePage2}>
                        <Icon name='caret' direction='left' class='btn-icon' />
                        Go back to page 1
                     </button>
                     <button type='button' onClick={openPage3}>
                        Next Page
                        <Icon name='caret' direction='right' class='btn-icon' />
                     </button>
                  </div>
               )}
            </StackView>
            <StackView isOpen={page3IsOpen} onCloseRequested={closePage3}>
               {() => (
                  <div class='w-full h-full grid place-items-center gap-0.5 place-content-center p-0.5'>
                     <div class='mb-2'>3</div>
                     <button type='button' onClick={closePage3}>
                        <Icon name='caret' direction='left' class='btn-icon' />
                        Go back to page 2
                     </button>
                  </div>
               )}
            </StackView>
         </StackViewGroup>
      </div>
   )
}

export default NavStack
