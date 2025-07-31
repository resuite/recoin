import { ContextMenu, type ContextMenuItemProps, ItemTypes } from '@/components/ui/context-menu'
import { Cell } from 'retend'

const ContextMenuTest = () => {
   const trigger = Cell.source<HTMLElement | null>(null)
   const checked = Cell.source(true)
   const checked2 = Cell.source(true)

   const items: ContextMenuItemProps[] = [
      {
         type: ItemTypes.Action,
         label: 'Copy',
         icon: 'document',
         onClick(event) {
            event.preventDefault()
         }
      },
      {
         type: ItemTypes.Action,
         label: 'Paste',
         icon: 'clipboard',
         onClick() {}
      },
      {
         type: ItemTypes.Action,
         label: 'Delete',
         icon: 'bin',
         onClick() {}
      },
      { type: ItemTypes.Separator },
      {
         type: ItemTypes.SubMenu,
         label: 'Export',
         icon: 'document-report',
         items: [
            {
               type: ItemTypes.Action,
               label: 'Export as PDF',
               icon: 'document',
               onClick() {}
            },
            {
               type: ItemTypes.Action,
               label: 'Export as Image',
               icon: 'text-size',
               onClick() {}
            },
            {
               type: ItemTypes.Action,
               label: 'Export as CSV',
               icon: 'grid',
               onClick() {}
            }
         ]
      },
      {
         type: ItemTypes.SubMenu,
         label: 'View',
         icon: 'git-fork',
         items: [
            {
               type: ItemTypes.Check,
               name: 'grid',
               label: 'Show Grid',
               checked: Cell.source(false),
               onCheckedChange(_value) {}
            },
            {
               type: ItemTypes.Check,
               name: 'rulers',
               label: 'Show Rulers',
               checked: Cell.source(true),
               onCheckedChange(_value) {}
            },
            { type: ItemTypes.Separator },
            {
               type: ItemTypes.SubMenu,
               label: 'Zoom',
               icon: 'search',
               items: [
                  {
                     type: ItemTypes.Action,
                     label: 'Zoom In',
                     shortcut: 'Ctrl++',
                     onClick() {}
                  },
                  {
                     type: ItemTypes.Action,
                     label: 'Zoom Out',
                     shortcut: 'Ctrl+-',
                     onClick() {}
                  },
                  {
                     type: ItemTypes.Action,
                     label: 'Fit to Screen',
                     shortcut: 'Ctrl+0',
                     onClick() {}
                  }
               ]
            }
         ]
      },
      {
         type: ItemTypes.Action,
         icon: 'share',
         label: 'Share',
         onClick() {}
      },
      { type: ItemTypes.Separator },
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
      }
   ]

   return (
      <div class='h-screen w-screen grid place-content-center place-items-center'>
         <div ref={trigger} class='px-4 py-2 border border-dashed rounded-xl cursor-pointer'>
            Right click to open context menu with submenus!
         </div>

         <ContextMenu trigger={trigger} items={items} />
      </div>
   )
}

export default ContextMenuTest
