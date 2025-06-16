import { Icon } from '@/components/icons';
import { VirtualKeyboardAwareView } from '@/components/views';

const KeyboardAvoidanceTest = () => {
   const handleVisibilityChange = (
      oldHeight: number,
      newHeight: number,
      activeElement: Element | null,
   ) => {
      if (!(activeElement instanceof HTMLInputElement)) {
         return;
      }
      const delta = newHeight - oldHeight;
      if (delta < 0 && activeElement.parentElement) {
         // Keyboard is visible.
         const form = activeElement.parentElement;
         form.style.translate = `0px ${delta}px`;
         form.addEventListener(
            'focusout',
            () => {
               form.style.removeProperty('translate');
            },
            { once: true },
         );
      }
   };

   const handleSubmit = () => {
      alert('Submitted!');
   };

   return (
      <VirtualKeyboardAwareView
         class='h-screen w-screen grid-lines px-1 pt-2 rounded-t-3xl overflow-hidden grid grid-rows-[auto_1fr_auto]'
         onVirtualKeyboardVisibilityChange={handleVisibilityChange}
      >
         <h1 class='text-bigger font-bold'>Keyboard Avoidance Test</h1>
         <p>
            This page demonstrates keyboard avoidance behavior when input fields
            are focused.
         </p>

         <form
            onSubmit--prevent={handleSubmit}
            class='grid grid-cols-[1fr_auto] mb-2 transition-transform duration-slow ease-out'
         >
            <input
               placeholder='Write something here...'
               class='w-full h-fit pl-0.25 focus-within:outline-0'
            />
            <button
               type='submit'
               class='button-bare min-w-0 border-0 border-b-[3px] rounded-[0px] border-light-yellow border-solid'
            >
               <Icon name='arrows' class='btn-icon -rotate-135' />
            </button>
         </form>
      </VirtualKeyboardAwareView>
   );
};

export default KeyboardAvoidanceTest;
