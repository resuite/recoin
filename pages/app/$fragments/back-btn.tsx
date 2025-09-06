import Arrows from '@/components/icons/svg/arrows'
import { useRouter } from 'retend/router'

export function BackButton() {
   const router = useRouter()
   return (
      <button
         type='button'
         class='button-bare text-big gap-0.25 absolute top-2 left-1'
         onClick={() => router.back()}
      >
         <Arrows class='h-1 rotate-45' />
         Back
      </button>
   )
}
