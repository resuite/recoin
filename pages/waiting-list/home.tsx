import { addEmailToWaitingList } from '@/api/modules/waiting-list/client'
import Arrows from '@/components/icons/svg/arrows'
import Loader from '@/components/icons/svg/loader'
import { Coins } from '@/components/illustrations/coins'
import { Button } from '@/components/ui/button'
import { WaitingListStateScope } from '@/scopes'
import { useErrorNotifier } from '@/utilities/composables/use-error-notifier'
import { Cell, If, useScopeContext } from 'retend'
import { Input } from 'retend-utils/components'
import { useRouter } from 'retend/router'

function WaitingListHome() {
   const { emailEntered } = useScopeContext(WaitingListStateScope)

   const router = useRouter()
   const email = Cell.source('')
   const resource = Cell.async(addEmailToWaitingList)
   const errorNotifier = useErrorNotifier()

   const handleSubmit = () => {
      resource.run(email.get())
   }

   resource.data.listen((data) => {
      if (!data?.success) {
         return
      }
      emailEntered.set(true)
      router.navigate('/waiting-list/success')
   })

   resource.error.listen(errorNotifier)

   return (
      <div class='relative grid grid-rows-[auto_1fr] grid-lines h-screen w-screen'>
         <header class='p-2 pb-1'>recoin.</header>
         <main
            class={[
               'px-2 pb-3 grid grid-cols-[.7fr_1fr] place-content-center place-self-center gap-x-3',
               'max-md:grid-cols-1 max-md:grid-rows-1 max-md:text-center'
            ]}
         >
            <HeadingText />
            <section class='[grid-area:2/1] grid gap-y-0.25'>
               <p>
                  recoin is your private, simple companion for managing finances. It aims to make
                  things perfectly clear, so you can easily see where your money comes from and
                  where it's headed.
               </p>
               <p>
                  recoin offers a clear view of your cash flow, helping you understand spending
                  habits and make informed financial decisions to achieve savings goals.
               </p>
               <p class='pb-0.25'>Be the first to experience it.</p>
               <form
                  class={['grid gap-y-0.5 max-w-17', 'max-md:place-items-center max-md:max-w-full']}
                  onSubmit--prevent={handleSubmit}
               >
                  <Input model={email} type='email' placeholder='Enter your email' required />
                  <Button
                     class={[
                        'grid grid-cols-[auto_auto] gap-x-0.25 place-items-center place-content-center',
                        'max-w-fit font-semibold',
                        'max-md:px-2'
                     ]}
                     type='submit'
                  >
                     {If(resource.pending, {
                        true: ButtonLoadingStateContent,
                        false: ButtonIdleStateContent
                     })}
                  </Button>
               </form>
            </section>
            <div class={['[grid-area:1/2/3/2] grid place-items-center', 'max-md:hidden']}>
               <Coins class='w-full max-w-[50dvw]' />
            </div>
         </main>
      </div>
   )
}

function HeadingText() {
   return (
      <h1
         class={[
            'grid text-large [grid-area:1/1] self-end pb-0.25',
            'max-md:text-title max-md:self-center'
         ]}
      >
         <div class='text-nowrap'>managing money</div>
         <div class='text-nowrap'>shouldn't be hard.</div>
      </h1>
   )
}

function ButtonLoadingStateContent() {
   return (
      <>
         <Loader class='w-0.75 h-0.75' />
         Joining...
      </>
   )
}

function ButtonIdleStateContent() {
   return (
      <>
         <Arrows class='w-0.75 h-0.75 -rotate-[135deg]' />
         Join the waiting list
      </>
   )
}

export default WaitingListHome
