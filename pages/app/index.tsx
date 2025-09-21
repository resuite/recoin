import { PullToRefreshView, SidebarProviderView } from '@/components/views'
import { FullScreenTransitionView } from '@/components/views/full-screen-transition-view'
import { ROOT_APP_OUTLET } from '@/constants'
import { GoogleIdentityProvider } from '@/integrations/google'
import { Sidebar } from '@/pages/app/_fragments/sidebar'
import StartPage from '@/pages/app/auth/start-page'
import { AuthenticationProvider, useAuthContext } from '@/scopes/auth'
import { Cell, useSetupEffect } from 'retend'
import { useRouter } from 'retend/router'

const AppContent = () => {
   const { Outlet } = useRouter()

   return (
      <PullToRefreshView class='dark-scheme'>
         {() => (
            <SidebarProviderView sidebar={() => <Sidebar />}>
               {() => (
                  <Outlet
                     id={ROOT_APP_OUTLET}
                     style={{ display: 'grid' }}
                     class='h-full select-none translate-0'
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
                  const { userData } = useAuthContext()
                  const isReady = Cell.source(false)

                  const userDataDefined = Cell.derived(() => {
                     return userData.get() !== null && isReady.get()
                  })

                  useSetupEffect(() => {
                     const timeout = setTimeout(() => {
                        isReady.set(true)
                     }, 200)

                     return () => clearTimeout(timeout)
                  })

                  return (
                     <FullScreenTransitionView
                        when={userDataDefined}
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
