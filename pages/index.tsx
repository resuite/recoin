import { Outlet } from 'retend/router'
import { ThemeProvider } from '@/scopes/theme'

const Index = () => {
   return <ThemeProvider scheme='dark'>{() => <Outlet />}</ThemeProvider>
}

export default Index
