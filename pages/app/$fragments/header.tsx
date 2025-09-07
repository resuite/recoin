import Hamburger from '@/components/icons/svg/hamburger'
import User from '@/components/icons/svg/user'
import { Button } from '@/components/ui/button'
import { useSidebarContext } from '@/components/views'

export function Header() {
   const { toggleSidebar } = useSidebarContext()

   return (
      <header class='grid grid-cols-[auto_1fr_auto] place-items-center p-1'>
         <Button
            style={{ rotate: 'calc(var(--sidebar-reveal) * 180deg)' }}
            class='touch-target button-bare pointer-events-auto'
            onClick={toggleSidebar}
         >
            <Hamburger class='h-1' />
         </Button>
         <div class='text-header'>recoin</div>
         <Button class='touch-target button-bare outline-[1.8px] rounded-full  h-1.25 w-1.25 flex items-center justify-center'>
            <User class='h-0.75 [&_path]:stroke-[1.8px]' />
         </Button>
      </header>
   )
}
