import { useRouter } from 'retend/router'

const Index = () => {
   const router = useRouter()
   return <router.Outlet />
}

export default Index
