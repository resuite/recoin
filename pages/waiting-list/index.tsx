import { addEmailToWaitingList } from '@/api/modules/waiting-list/client';
import { Icon } from '@/components/icons';
import { Coins } from '@/components/illustrations/coins';
import { useToast } from '@/components/ui';
import { Cell, If } from 'retend';
import { Input } from 'retend-utils/components';

const WaitingList = () => {
   const email = Cell.source('');
   const resource = Cell.async(addEmailToWaitingList);
   const { ToastContainer, showToast } = useToast();

   const handleSubmit = () => {
      resource.run(email.get());
   };

   const ButtonLoadingStateContent = () => {
      return (
         <>
            <Icon name='loader' class='w-0.75 h-0.75' />
            Joining...
         </>
      );
   };

   const ButtonIdleStateContent = () => {
      return (
         <>
            <Icon name='arrows' class='w-0.75 h-0.75 -rotate-[135deg]' />
            Join the waiting list
         </>
      );
   };

   resource.data.listen((data) => {
      console.log(data);
      showToast({
         content: 'Email added to waiting list!',
         duration: 3000,
      });
   });

   resource.error.listen((error) => {
      console.log(error);
   });

   return (
      <div class='relative grid grid-lines h-screen w-screen'>
         <ToastContainer />
         <header class='absolute p-2'>recoin.</header>
         <main class='px-2 grid grid-cols-[.7fr_1fr] place-content-center place-self-center gap-x-3'>
            <h1 class='text-large [grid-area:1/1] place-self-end pb-0.5'>
               managing money shouldn't be hard.
            </h1>
            <section class='[grid-area:2/1] grid gap-y-0.25'>
               <p>
                  recoin is your private, simple companion for managing
                  finances. It aims to make things perfectly clear, so you can
                  easily see where your money comes from and where it's headed.
               </p>
               <p>
                  recoin offers a clear view of your cash flow, helping you
                  understand spending habits and make informed financial
                  decisions to achieve savings goals.
               </p>
               <p class='pb-0.25'>Be the first to experience it.</p>
               <form
                  class='grid gap-y-0.5 max-w-17'
                  onSubmit--prevent={handleSubmit}
               >
                  <Input
                     model={email}
                     type='email'
                     placeholder='Enter your email'
                     required
                  />
                  <button
                     class='grid max-w-fit grid-cols-[auto_auto] gap-x-0.25 font-semibold place-items-center place-content-center'
                     type='submit'
                  >
                     {If(resource.pending, {
                        true: ButtonLoadingStateContent,
                        false: ButtonIdleStateContent,
                     })}
                  </button>
               </form>
            </section>
            <div class='[grid-area:1/2/3/2] grid place-items-center'>
               <Coins class='w-full max-w-[50dvw]' />
            </div>
         </main>
      </div>
   );
};

export default WaitingList;
