import { useRouter } from 'retend/router'

const App = () => {
   const router = useRouter()
   return (
      <div class='h-screen w-screen grid place-items-center place-content-center'>
         <div class='text-large'>recoin.</div>
         <router.Link href='/styleguide'>Go to styleguide</router.Link>
      </div>
   )
}

export default App
