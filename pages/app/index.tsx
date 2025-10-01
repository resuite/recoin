import { FullScreenTransitionView } from '@/components/views/full-screen-transition-view'
import { type PullState, PullToRefreshView } from '@/components/views/pull-to-refresh-view'
import { SidebarProviderView } from '@/components/views/sidebar-provider-view'
import { ROOT_APP_OUTLET } from '@/constants'
import { createRecoinStore } from '@/data/livestore/store'
import { GoogleIdentityProvider } from '@/integrations/google'
import { PullToRefreshFeedback } from '@/pages/app/(fragments)/pull-to-refresh-feedback'
import { Sidebar } from '@/pages/app/(fragments)/sidebar'
import Loading from '@/pages/app/auth/loading'
import Onboarding from '@/pages/app/auth/onboarding'
import StartPage from '@/pages/app/auth/start-page'
import { AuthenticationProvider } from '@/scopes/auth'
import { LiveStoreProvider } from '@/scopes/livestore'
import { useApplicationSetup } from '@/utilities/composables/use-application-setup'
import { Cell } from 'retend'
import { useRouter } from 'retend/router'

const AppContent = () => {
   const { Outlet } = useRouter()
   const pullToRefreshState = Cell.source<PullState>('idle')

   const handlePullToRefreshStateChange = (state: PullState) => {
      pullToRefreshState.set(state)
   }

   const handlePullToRefreshAction = async () => {
      await new Promise((resolve) => setTimeout(resolve, 3500))
   }

   return (
      <PullToRefreshView
         class='dark-scheme select-none'
         feedback={() => <PullToRefreshFeedback state={pullToRefreshState} />}
         onStateChange={handlePullToRefreshStateChange}
         onActionTriggered={handlePullToRefreshAction}
      >
         {() => (
            <SidebarProviderView sidebar={() => <Sidebar />}>
               {() => (
                  <Outlet
                     id={ROOT_APP_OUTLET}
                     style={{ display: 'grid' }}
                     class='h-full translate-0'
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
         {() => (
            <AuthenticationProvider>
               {() => (
                  <LiveStoreProvider initStore={createRecoinStore} fallback={Loading}>
                     {AppRoot}
                  </LiveStoreProvider>
               )}
            </AuthenticationProvider>
         )}
      </GoogleIdentityProvider>
   )
}

export default App
