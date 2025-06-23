import { PRE_RELEASE } from '@/constants'
import { useRouter } from 'retend/router'

const Index = () => {
   const router = useRouter()
   if (PRE_RELEASE === 'true') {
      return router.navigate('/waiting-list')
   }

   return <div>Welcome to recoin!</div>
}

export default Index
