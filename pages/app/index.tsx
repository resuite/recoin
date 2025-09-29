import { PullToRefreshView, SidebarProviderView } from '@/components/views'
import { FullScreenTransitionView } from '@/components/views/full-screen-transition-view'
import { ROOT_APP_OUTLET } from '@/constants'
import { GoogleIdentityProvider } from '@/integrations/google'
import { Sidebar } from '@/pages/app/_fragments/sidebar'
import Onboarding from '@/pages/app/auth/onboarding'
import StartPage from '@/pages/app/auth/start-page'
import { AuthenticationProvider } from '@/scopes/auth'
import { useApplicationSetup } from '@/utilities/composables/use-application-setup'
import { Cell } from 'retend'
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

const AppRoot = () => {
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
}

const App = () => {
   return (
      <GoogleIdentityProvider>
         {() => <AuthenticationProvider>{AppRoot}</AuthenticationProvider>}
      </GoogleIdentityProvider>
   )
}

export default App
