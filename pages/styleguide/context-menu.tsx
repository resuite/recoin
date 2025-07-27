import { ContextMenu } from '@/components/ui/context-menu'
import { Cell } from 'retend'

const ContextMenuTest = () => {
   const contextMenuTriggerRef = Cell.source<HTMLElement | null>(null)

   return (
      <div class='h-screen w-screen grid place-content-center place-items-center'>
         <div
            ref={contextMenuTriggerRef}
            class='px-6 py-2 border border-dashed rounded-xl cursor-pointer'
         >
            Right click to open context menu
         </div>

         <ContextMenu
            class='light-scheme p-1 rounded-xl'
            triggerRef={contextMenuTriggerRef}
         >
            {() => <>Hello world</>}
         </ContextMenu>
      </div>
   )
}

export default ContextMenuTest
