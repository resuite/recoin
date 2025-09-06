import { PullToRefreshView, SidebarProviderView } from '@/components/views'
import { FullScreenTransitionView } from '@/components/views/full-screen-transition-view'
import { GoogleIdentityProvider } from '@/integrations/google'
import { Sidebar } from '@/pages/app/$fragments/sidebar'
import StartPage from '@/pages/app/auth/start-page'
import { AuthScope, AuthenticationProvider } from '@/scopes/auth'
import { Cell, useScopeContext } from 'retend'
import { useRouter } from 'retend/router'

const AppContent = () => {
   const { Outlet } = useRouter()
   return (
      <PullToRefreshView class='dark-scheme'>
         {() => (
            <SidebarProviderView sidebar={() => <Sidebar />}>
               {() => (
                  <Outlet
                     style={{ display: 'grid' }}
                     class='light-scheme grid-rows-[auto_1fr] h-full translate-0 rounded-t-3xl'
                  />
               )}
            </SidebarProviderView>
         )}
      </PullToRefreshView>
   )
}

const App = () => {
   return (
      <GoogleIdentityProvider>
         {() => (
            <AuthenticationProvider>
               {() => {
                  const { authState } = useScopeContext(AuthScope)
                  const isReady = Cell.derived(() => {
                     return authState.get() === 'ready'
                  })
                  return (
                     <FullScreenTransitionView
                        when={isReady}
                        transition='slide-up'
                        from={StartPage}
                        to={AppContent}
                        class='grid-lines-with-fade'
                     />
                  )
               }}
            </AuthenticationProvider>
         )}
      </GoogleIdentityProvider>
   )
}

export default App
