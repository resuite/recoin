import { VirtualKeyboardAwareView } from '@/components/views';
import { Cell } from 'retend';
import { useMatchMedia } from 'retend-utils/hooks';

const KeyboardAvoidanceTest = () => {
   const height = Cell.source('100dvh');
   const watcher = useMatchMedia('(max-height: 600px)');
   const handleVisibilityChange = (_: number, newHeight: number) => {
      height.set(`${newHeight}px`);
   };

   return (
      <VirtualKeyboardAwareView
         class={[
            'h-screen w-screen grid-lines px-1 pt-2 rounded-t-3xl grid grid-rows-[auto_1fr_auto]',
            'duration-device transition-[height] default-timing',
         ]}
         onVirtualKeyboardVisibilityChange={handleVisibilityChange}
         style={{ height }}
      >
         <h1 class='text-bigger font-bold'>Keyboard Avoidance Test</h1>
         <p>
            This page demonstrates keyboard avoidance behavior when input fields
            are focused.
            <br />
            Window Height less than 600px: {watcher}
         </p>

         <input
            placeholder='Write something here...'
            class='w-full h-fit pl-0.25 mb-1'
         />
      </VirtualKeyboardAwareView>
   );
};

export default KeyboardAvoidanceTest;
