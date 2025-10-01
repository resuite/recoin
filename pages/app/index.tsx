import Loader from '@/components/icons/svg/loader'
import { FullScreenTransitionView } from '@/components/views/full-screen-transition-view'
import { type PullState, PullToRefreshView } from '@/components/views/pull-to-refresh-view'
import { SidebarProviderView } from '@/components/views/sidebar-provider-view'
import { ROOT_APP_OUTLET } from '@/constants'
import { createRecoinStore } from '@/database/store'
import { GoogleIdentityProvider } from '@/integrations/google'
import { PullToRefreshFeedback } from '@/pages/app/(fragments)/pull-to-refresh-feedback'
import { Sidebar } from '@/pages/app/(fragments)/sidebar'
import { Stage } from '@/pages/app/(fragments)/stage'
import Onboarding from '@/pages/app/auth/onboarding'
import StartPage from '@/pages/app/auth/start-page'
import { AuthenticationProvider } from '@/scopes/auth'
import { LiveStoreProvider } from '@/scopes/livestore'
import { useApplicationSetup } from '@/utilities/composables/use-application-setup'
import { Cell, If } from 'retend'
import { useRouter } from 'retend/router'

const AppContent = () => {
   const { Outlet } = useRouter()
   const pullToRefreshState = Cell.source<PullState>('idle')
   const { hasFinishedOnboarding } = useApplicationSetup()

   const handlePullToRefreshStateChange = (state: PullState) => {
      pullToRefreshState.set(state)
   }

   const handlePullToRefreshAction = async () => {
      await new Promise((resolve) => setTimeout(resolve, 3500))
   }

   const StoreLoadingFallback = () => {
      return If(hasFinishedOnboarding, {
         true: () => (
            <Stage class='grid place-items-center'>
               <Loader class='h-1.5' />
            </Stage>
         ),
         false: () => (
            <div class='h-full w-full grid place-items-center'>
               <Loader class='h-2' />
            </div>
         )
      })
   }

   return (
      <LiveStoreProvider initStore={createRecoinStore} fallback={StoreLoadingFallback}>
         {() => (
            <FullScreenTransitionView
               when={hasFinishedOnboarding}
               transition='slide-up'
               from={Onboarding}
               to={() => (
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
               )}
            />
         )}
      </LiveStoreProvider>
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
         to={AppContent}
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
