import { ToastProvider } from '@/components/ui/toast'
import { useRouter } from 'retend/router'

const Index = () => {
   const router = useRouter()
   return <ToastProvider>{() => <router.Outlet />}</ToastProvider>
}

export default Index
