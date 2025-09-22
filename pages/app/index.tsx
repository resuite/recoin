import { PullToRefreshView, SidebarProviderView } from '@/components/views'
import { FullScreenTransitionView } from '@/components/views/full-screen-transition-view'
import { ROOT_APP_OUTLET } from '@/constants'
import { initializeDbWorker } from '@/data'
import { GoogleIdentityProvider } from '@/integrations/google'
import { Sidebar } from '@/pages/app/_fragments/sidebar'
import Onboarding from '@/pages/app/auth/onboarding'
import StartPage from '@/pages/app/auth/start-page'
import { AuthenticationProvider, useAuthContext } from '@/scopes/auth'
import { Cell, useSetupEffect } from 'retend'
import { useRouter } from 'retend/router'

function useApplicationSetup() {
   const { userData } = useAuthContext()
   const waitTimeLoaded = Cell.source(false)

   const ready = Cell.derived(() => {
      return userData.get() !== null && waitTimeLoaded.get()
   })

   const hasFinishedOnboarding = Cell.derived(() => {
      return Boolean(userData.get()?.workspaces[0]?.currency)
   })

   useSetupEffect(() => {
      initializeDbWorker()
      const timeout = setTimeout(() => {
         waitTimeLoaded.set(true)
      }, 200)

      return () => clearTimeout(timeout)
   })

   return { hasFinishedOnboarding, ready }
}

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
                  const { ready, hasFinishedOnboarding } = useApplicationSetup()
                  const initialTransition = Cell.derived(() => {
                     return hasFinishedOnboarding.get() ? 'slide-up' : 'fade-in'
                  })

                  return (
                     <FullScreenTransitionView
                        when={ready}
                        transition={initialTransition}
                        from={StartPage}
                        to={() => (
                           <FullScreenTransitionView
                              when={hasFinishedOnboarding}
                              transition='slide-up'
                              from={Onboarding}
                              to={AppContent}
                           />
                        )}
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
