import { PopoverView } from '@/components/views'
import { Cell } from 'retend'

const PopoverTest = () => {
   const popoverIsOpen = Cell.source(true)
   const anchorRef = Cell.source<HTMLElement | null>(null)

   const togglePopover = () => {
      popoverIsOpen.set(!popoverIsOpen.peek())
   }

   const PopoverContent = () => {
      return (
         <div class='text-center light-scheme p-1 rounded-xl grid place-items-center place-content-center gap-0.5 animate-fade-y [--starting-translate:0_-30px] h-full'>
            <span>We are inside the popover.</span>
         </div>
      )
   }

   return (
      <div class='grid grid-cols-1 place-items-center h-screen'>
         <button ref={anchorRef} type='button' onClick={togglePopover}>
            Open Popover
         </button>
         <PopoverView
            class='w-fit h-9'
            isOpen={popoverIsOpen}
            anchorRef={anchorRef}
            positionArea='bottom center'
            justifySelf='start'
            content={PopoverContent}
         />
      </div>
   )
}

export default PopoverTest
