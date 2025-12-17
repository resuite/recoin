import { Cell, type SourceCell } from 'retend'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { type Alignment, PopoverView, type PositionArea } from '@/components/views/popover-view'

function PopoverTest() {
   const popoverIsOpen = Cell.source(false)
   const anchorRef = Cell.source<HTMLButtonElement | null>(null)
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
            <Input label='Position Area:' type='text' model={positionArea as SourceCell<string>} />
            <Input label='Justify Self:' type='text' model={justifySelf as SourceCell<string>} />
            <Input label='Align Self:' type='text' model={alignSelf as SourceCell<string>} />
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
               <div class='text-center p-1 rounded-xl grid place-items-center place-content-center gap-0.5 animate-fade-y [--starting-translate:0_-30px] h-full'>
                  <span>We are inside the popover.</span>
               </div>
            )}
         </PopoverView>
      </div>
   )
}

export default PopoverTest
