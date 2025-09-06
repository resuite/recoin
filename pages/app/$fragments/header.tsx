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
         <div class='text-header'>recoin.</div>
         <Button class='touch-target button-bare '>
            <User class='h-1' />
         </Button>
      </header>
   )
}
