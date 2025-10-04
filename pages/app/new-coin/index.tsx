import { Button } from '@/components/ui/button'
import { Coin } from '@/components/ui/coin'
import { SafeAreaView } from '@/components/views/safe-area-view'
import { useVerticalPanContext } from '@/components/views/vertical-pan-view'
import type { Achievement } from '@/database/models/achievement'
import { achievementTitleAndMessage } from '@/utilities/achievement-messages'
import { Cell } from 'retend'

interface NewCoinProps {
   achievement: Achievement
}

const NewCoin = (props: NewCoinProps) => {
   const { achievement } = props
   const { close } = useVerticalPanContext()
   const { title, message } = achievementTitleAndMessage(achievement.name)
   const showingOtherDetails = Cell.source(false)
   const hidingOtherDetails = Cell.derived(() => {
      return !showingOtherDetails.get()
   })

   const showOtherDetails = () => {
      showingOtherDetails.set(true)
   }

   return (
      <SafeAreaView
         class={[
            'grid grid-rows-[1fr_auto] place-content-center place-items-center grid-cols-1',
            'w-full h-full px-1 pb-1.5'
         ]}
         data-show-other-details={showingOtherDetails}
      >
         <div
            class={[
               'w-full flex flex-col items-center justify-center gap-0.5 text-center',
               '[&>*:not(animated-coin)]:duration-default [&>*:not(animated-coin)]:transition-opacity',
               '[&:not([data-show-other-details]>*)>*:not(animated-coin)]:opacity-0'
            ]}
         >
            <Coin
               icon={achievement.icon}
               spinning
               size='min(50dvw, 275px)'
               onSettled={showOtherDetails}
            />
            <div ariaHidden={hidingOtherDetails}>
               <h2 class='text-logo'>{title}</h2>
               <p>{message}</p>
            </div>
         </div>

         <Button
            disabled={hidingOtherDetails}
            type='button'
            class={[
               'btn-outline w-full',
               'duration-default transition-opacity not-[&[data-show-other-details]>*]:opacity-0!'
            ]}
            onClick={close}
         >
            Close
         </Button>
      </SafeAreaView>
   )
}

export default NewCoin
