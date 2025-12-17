import { useRouter } from 'retend/router'
import { Stage } from '@/pages/app/(fragments)/stage'

export default function Profile() {
   const { Link } = useRouter()

   return (
      <Stage class='grid place-items-center'>
         {() => (
            <div class='text-center'>
               <h1 class='text-title mb-2'>Profile</h1>
               <Link href='/styleguide'>Go to Styleguide.</Link>
               <p class='text-body'>Coming soon...</p>
            </div>
         )}
      </Stage>
   )
}
