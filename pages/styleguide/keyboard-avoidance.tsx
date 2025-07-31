import { VirtualKeyboardAwareView } from '@/components/views'
import { Cell } from 'retend'

const KeyboardAvoidanceTest = () => {
   const height = Cell.source('100dvh')
   const handleVisibilityChange = (_: number, newHeight: number) => {
      height.set(`${newHeight}px`)
   }

   return (
      <VirtualKeyboardAwareView
         class={[
            'h-screen w-screen grid-lines px-1 pt-2 rounded-t-3xl grid grid-rows-[auto_1fr_auto]'
         ]}
         onVirtualKeyboardVisibilityChange={handleVisibilityChange}
         style={{ height }}
      >
         <h1 class='text-bigger font-bold'>Keyboard Avoidance Test</h1>
         <p>This page demonstrates keyboard avoidance behavior when input fields are focused.</p>

         <input placeholder='Write something here...' class='w-full h-fit pl-0.25 mb-1' />
      </VirtualKeyboardAwareView>
   )
}

export default KeyboardAvoidanceTest
