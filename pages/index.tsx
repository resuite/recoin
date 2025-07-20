import { ToastContainer } from '@/components/ui'
import { useRouter } from 'retend/router'

const Index = () => {
   const router = useRouter()
   return <ToastContainer content={router.Outlet} />
}

export default Index
