import { Button } from '@/components/ui/button'
import { type Alignment, PopoverView, type PositionArea } from '@/components/views/popover-view'
import { Cell, type SourceCell } from 'retend'
import { Input } from 'retend-utils/components'

function PopoverTest() {
   const popoverIsOpen = Cell.source(false)
   const anchorRef = Cell.source<HTMLElement | null>(null)
   const positionArea = Cell.source<PositionArea>('bottom center')
   const justifySelf = Cell.source<Alignment | undefined>(undefined)
   const alignSelf = Cell.source<Alignment | undefined>(undefined)

   const togglePopover = () => {
      popoverIsOpen.set(!popoverIsOpen.get())
   }

   return (
      <div class='grid grid-cols-1 place-items-center h-screen'>
         <Button ref={anchorRef} type='button' onClick={togglePopover}>
            Open Popover
         </Button>
         <div class='grid grid-cols-3 gap-2'>
            <label for='positionArea'>
               <span>Position Area:</span>
               <Input type='text' model={positionArea as SourceCell<string>} />
            </label>
            <label for='justifySelf'>
               <span>Justify Self:</span>
               <Input type='text' model={justifySelf as SourceCell<string>} />
            </label>
            <label for='alignSelf'>
               <span>Align Self:</span>
               <Input type='text' model={alignSelf as SourceCell<string>} />
            </label>
         </div>

         <PopoverView
            class='w-fit h-9 duration-slow transition-[top,left,right,bottom] transition-discrete'
            isOpen={popoverIsOpen}
            anchor={anchorRef}
            positionArea={positionArea}
            justifySelf={justifySelf}
            alignSelf={alignSelf}
         >
            {() => (
               <div class='text-center light-scheme p-1 rounded-xl grid place-items-center place-content-center gap-0.5 animate-fade-y [--starting-translate:0_-30px] h-full'>
                  <span>We are inside the popover.</span>
               </div>
            )}
         </PopoverView>
      </div>
   )
}

export default PopoverTest
