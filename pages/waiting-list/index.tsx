import { RecoinError } from '@/api/error';
import { addEmailToWaitingList } from '@/api/modules/waiting-list/client';
import { Icon } from '@/components/icons';
import { Coins } from '@/components/illustrations/coins';
import { useToast } from '@/components/ui';
import { errorCodeToHumanReadable } from '@/utilities/error-messages';
import { Cell, If } from 'retend';
import { Input } from 'retend-utils/components';
import { useRouter } from 'retend/router';

const WaitingList = () => {
   const router = useRouter();
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
      if (!data?.success) {
         return;
      }
      router.navigate('/waiting-list/success');
   });

   resource.error.listen((error) => {
      if (!(error instanceof RecoinError)) {
         return;
      }
      const content = errorCodeToHumanReadable(error.errorCode);
      showToast({ content, duration: 3000 });
   });

   return (
      <div class='relative grid grid-rows-[auto_1fr] grid-lines h-screen w-screen'>
         <ToastContainer />
         <header class='p-2 pb-1'>recoin.</header>
         <main
            class={[
               'px-2 pb-3 grid grid-cols-[.7fr_1fr] place-content-center place-self-center gap-x-3',
               'max-md:grid-cols-1 max-md:grid-rows-1 max-md:text-center',
            ]}
         >
            <h1
               class={[
                  'grid text-large [grid-area:1/1] self-end pb-0.25',
                  'max-md:text-title max-md:self-center',
               ]}
            >
               <div class='text-nowrap'>managing money</div>
               <div class='text-nowrap'>shouldn't be hard.</div>
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
                  class={[
                     'grid gap-y-0.5 max-w-17',
                     'max-md:place-items-center max-md:max-w-full',
                  ]}
                  onSubmit--prevent={handleSubmit}
               >
                  <Input
                     model={email}
                     type='email'
                     placeholder='Enter your email'
                     required
                  />
                  <button
                     class={[
                        'grid grid-cols-[auto_auto] gap-x-0.25 place-items-center place-content-center',
                        'max-w-fit font-semibold',
                        'max-md:px-2',
                     ]}
                     type='submit'
                  >
                     {If(resource.pending, {
                        true: ButtonLoadingStateContent,
                        false: ButtonIdleStateContent,
                     })}
                  </button>
               </form>
            </section>
            <div
               class={[
                  '[grid-area:1/2/3/2] grid place-items-center',
                  'max-md:hidden',
               ]}
            >
               <Coins class='w-full max-w-[50dvw]' />
            </div>
         </main>
      </div>
   );
};

export default WaitingList;
