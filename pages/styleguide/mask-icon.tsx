import { AsyncMaskIcon, MaskIcon } from '@/components/icons/icon-mask'
import Checkmark from '@/components/icons/svg/checkmark'
import Heart from '@/components/icons/svg/heart'
import Star from '@/components/icons/svg/sparkle'

const MaskIconTest = () => {
   return (
      <div class='min-h-screen py-4 grid place-content-center dark-scheme'>
         <h2 class='text-header mb-6 text-center'>Mask Icon</h2>

         <div class='grid md:grid-cols-2 gap-8 mb-6'>
            <section class='text-center'>
               <h3 class='text-big mb-3'>MaskIcon (sync)</h3>
               <div class='grid grid-cols-3 gap-4 place-items-center'>
                  <div class='grid place-items-center gap-2'>
                     <MaskIcon src={Checkmark} class='w-3 h-3 bg-green-500' />
                     <span class='text-body'>Checkmark</span>
                  </div>
                  <div class='grid place-items-center gap-2'>
                     <MaskIcon src={Star} class='w-3 h-3 bg-yellow-500' />
                     <span class='text-body'>Sparkle</span>
                  </div>
                  <div class='grid place-items-center gap-2'>
                     <MaskIcon src={Heart} class='w-3 h-3 bg-red-500' />
                     <span class='text-body'>Heart</span>
                  </div>
               </div>
            </section>

            <section class='text-center'>
               <h3 class='text-big mb-3'>AsyncMaskIcon (async)</h3>
               <div class='grid grid-cols-3 gap-4 place-items-center'>
                  <div class='grid place-items-center gap-2'>
                     <AsyncMaskIcon name='wallet' class='w-3 h-3 bg-blue-500' />
                     <span class='text-body'>wallet</span>
                  </div>
                  <div class='grid place-items-center gap-2'>
                     <AsyncMaskIcon name='trophy' class='w-3 h-3 bg-amber-500' />
                     <span class='text-body'>trophy</span>
                  </div>
                  <div class='grid place-items-center gap-2'>
                     <AsyncMaskIcon name='shield' class='w-3 h-3 bg-purple-500' />
                     <span class='text-body'>shield</span>
                  </div>
               </div>
            </section>
         </div>

         <p class='text-body text-center max-w-md'>
            MaskIcon and AsyncMaskIcon render SVGs as CSS masks, allowing background colors to show
            through.
         </p>
      </div>
   )
}

export default MaskIconTest
