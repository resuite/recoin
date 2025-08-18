import Pallete from '@/components/icons/svg/pallete'
import RecoinBaseIcon from '@/components/icons/svg/recoin'
import { FloatingActionButton } from '@/components/ui/floating-action-button'

const StartScreen = () => {
   return (
      <div
         class={[
            'h-screen grid-lines [--grid-lines-color:#faffed20] w-screen grid place-items-center place-content-center',
            'before:pointer-events-none before:block before:absolute before:h-full before:w-full',
            'before:bg-linear-to-b before:from-base before:via-transparent before:via-30% before:to-transparent'
         ]}
      >
         <div class='relative h-full w-full grid place-items-center place-content-center'>
            <RecoinBaseIcon class='h-5' />
            <FloatingActionButton
               class='grid-center'
               block='bottom'
               inline='right'
               asLink
               href='/styleguide'
            >
               <Pallete />
            </FloatingActionButton>
         </div>
      </div>
   )
}

export default StartScreen
