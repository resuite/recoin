import Hamburger from '@/components/icons/svg/hamburger'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useSidebarContext } from '@/components/views/sidebar-provider-view'
import { useAuthContext } from '@/scopes/auth'
import { Cell } from 'retend'
import { useRouter } from 'retend/router'

export function Header() {
   const { toggleSidebar } = useSidebarContext()
   const { userData } = useAuthContext()
   const { navigate } = useRouter()
   const avatarUrl = Cell.derived(() => userData.get()?.avatarUrl)

   const handleProfileClick = () => {
      navigate('/app/profile')
   }

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
         <Avatar
            src={avatarUrl}
            alt='Profile'
            class='touch-target button-bare'
            onClick={handleProfileClick}
         />
      </header>
   )
}
