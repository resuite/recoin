import Checkmark from '@/components/icons/svg/checkmark'
import { emailEntered } from '@/pages/waiting-list/state'
import { useRouter } from 'retend/router'

const ComingSoonWaitingListSuccess = () => {
   const router = useRouter()

   if (!emailEntered.get()) {
      return router.navigate('/waiting-list')
   }

   return (
      <div class='relative grid grid-rows-1 grid-lines h-screen w-screen'>
         <header class='absolute p-2'>recoin.</header>
         <main class='grid w-full h-full text-center place-items-center place-content-center'>
            <section class='grid place-items-center gap-1.5'>
               <Checkmark class='w-[70px] h-[70px]' />
               <h1 class='text-3xl font-bold'>You're on the list!</h1>
               <p class='grid grid-rows-2 gap-0.5 px-2'>
                  <span>
                     We'll send updates and your early access invitation to your
                     email.
                  </span>
                  <span>
                     Keep an eye out, we'll be in touch the moment recoin is
                     ready to launch.
                  </span>
               </p>
            </section>
         </main>
      </div>
   )
}

export default ComingSoonWaitingListSuccess
