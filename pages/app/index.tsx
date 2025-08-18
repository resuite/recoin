import { useRouter } from 'retend/router'

const App = () => {
   const { Outlet } = useRouter()
   return <Outlet />
}

export default App
