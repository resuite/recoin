import { ContextMenu, ItemTypes } from '@/components/ui/context-menu'
import { Cell } from 'retend'

const ContextMenuTest = () => {
   const trigger = Cell.source<HTMLElement | null>(null)
   const checked = Cell.source(true)
   const checked2 = Cell.source(true)
   const selected = Cell.source('battery')

   return (
      <div class='light-scheme h-screen w-screen grid place-content-center place-items-center'>
         <div
            ref={trigger}
            class='px-4 py-2 border border-dashed rounded-xl cursor-pointer'
         >
            Right click to open context menu Is it supported, though?
         </div>

         <ContextMenu
            class='bg-canvas-background border-zinc-500 border-[0.25px]'
            trigger={trigger}
            items={[
               {
                  type: ItemTypes.Action,
                  label: 'Copy',
                  onClick() {}
               },
               {
                  type: ItemTypes.Action,
                  label: 'Paste',
                  onClick() {}
               },
               {
                  type: ItemTypes.Action,
                  label: 'Delete',
                  onClick() {}
               },
               { type: ItemTypes.Separator },
               {
                  type: ItemTypes.Action,
                  icon: 'share',
                  label: 'Share',
                  onClick() {}
               },
               {
                  type: ItemTypes.Check,
                  name: 'shield',
                  icon: 'shield',
                  checked,
                  label: 'Show Hidden Files',
                  onCheckedChange(value) {
                     checked.set(value)
                  }
               },
               {
                  type: ItemTypes.Check,
                  name: 'moon',
                  icon: 'moon',
                  label: 'Enable Dark Mode',
                  checked: checked2,
                  onCheckedChange(value) {
                     checked2.set(value)
                  }
               },
               { type: ItemTypes.Separator },
               {
                  type: ItemTypes.Radio,
                  name: 'sort',
                  icon: 'arrows',
                  value: 'name',
                  label: 'Sort By: Name',
                  onSelect(value) {
                     selected.set(value)
                  }
               },
               {
                  name: 'sort',
                  type: ItemTypes.Radio,
                  icon: 'calendar',
                  value: 'date',
                  label: 'Sort By: Date',
                  onSelect(value) {
                     selected.set(value)
                  }
               },
               {
                  type: ItemTypes.Radio,
                  name: 'sort',
                  icon: 'database',
                  value: 'size',
                  label: 'Sort By: Size',
                  onSelect(value) {
                     selected.set(value)
                  }
               }
            ]}
         />
      </div>
   )
}

export default ContextMenuTest
