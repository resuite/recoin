import {
   type KeyboardVisibilityEvent,
   VirtualKeyboardAwareView,
   VirtualKeyboardTriggers
} from '@/components/views'
import { Cell } from 'retend'

const KeyboardAvoidanceTest = () => {
   const keyboardHeight = Cell.source(0)
   const handleVisibilityChange = (event: KeyboardVisibilityEvent) => {
      keyboardHeight.set(event.approximateHeight)
   }

   const translate = Cell.derived(() => {
      return `0px -${keyboardHeight.get()}px`
   })

   return (
      <VirtualKeyboardAwareView
         class='h-screen w-screen grid-lines px-1 pt-2 rounded-t-3xl grid grid-rows-[auto_1fr_auto]'
         onKeyboardVisibilityChange={handleVisibilityChange}
      >
         {() => (
            <>
               <h1 class='text-bigger font-bold'>Keyboard Avoidance Tests</h1>
               <p>
                  This page demonstrates keyboard avoidance behavior when input fields are focused.
                  Keyboard Height: {keyboardHeight}
               </p>
               <VirtualKeyboardTriggers>
                  <input
                     placeholder='Write something here...'
                     class='w-full h-fit pl-0.25 mb-1 duration-slow will-change-transform'
                     style={{ translate }}
                  />
               </VirtualKeyboardTriggers>
            </>
         )}
      </VirtualKeyboardAwareView>
   )
}

export default KeyboardAvoidanceTest
