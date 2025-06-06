import { Icon } from '@recoin/components/icons';
import { StackView, StackViewGroup } from '@recoin/components/layout';
import { Cell } from 'retend';

const page2IsOpen = Cell.source(false);
const page3IsOpen = Cell.source(false);

const NavStack = () => {
   return (
      <div class='w-full rounded-t-4xl light-scheme overflow-hidden'>
         <StackViewGroup class='h-screen text-large'>
            <StackView root content={Page1} />
            <StackView
               isOpen={page2IsOpen}
               onCloseRequested={() => page2IsOpen.set(false)}
               content={Page2}
            />
            <StackView
               isOpen={page3IsOpen}
               onCloseRequested={() => page3IsOpen.set(false)}
               content={Page3}
            />
         </StackViewGroup>
      </div>
   );
};

const Page1 = () => (
   <div class='w-full h-full grid place-items-center gap-0.5 place-content-center p-0.5'>
      <div class='mb-2'>1</div>
      <button type='button' onClick={() => page2IsOpen.set(true)}>
         Next Page
         <Icon name='caret' direction='right' class='btn-icon' />
      </button>
   </div>
);

const Page2 = () => (
   <div class='w-full h-full grid place-items-center gap-0.5 place-content-center p-0.5'>
      <div class='mb-2'>2</div>
      <button type='button' onClick={() => page2IsOpen.set(false)}>
         <Icon name='caret' direction='left' class='btn-icon' />
         Go back to page 1
      </button>
      <button type='button' onClick={() => page3IsOpen.set(true)}>
         Next Page
         <Icon name='caret' direction='right' class='btn-icon' />
      </button>
   </div>
);

const Page3 = () => (
   <div class='w-full h-full grid place-items-center gap-0.5 place-content-center p-0.5'>
      <div class='mb-2'>3</div>
      <button type='button' onClick={() => page3IsOpen.set(false)}>
         <Icon name='caret' direction='left' class='btn-icon' />
         Go back to page 2
      </button>
   </div>
);

export default NavStack;
