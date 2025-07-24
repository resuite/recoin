import { ToastContainer } from '@/components/ui'
import { useRouter } from 'retend/router'

const Index = () => {
   const router = useRouter()
   return <ToastContainer>{router.Outlet}</ToastContainer>
}

export default Index
