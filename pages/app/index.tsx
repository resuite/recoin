import { If } from 'retend'
import { Outlet } from 'retend/router'
import Loader from '@/components/icons/svg/loader'
import { ToastProvider } from '@/components/ui/toast'
import { FullScreenTransitionView } from '@/components/views/full-screen-transition-view'
import { SidebarProviderView } from '@/components/views/sidebar-provider-view'
import { VerticalPanView } from '@/components/views/vertical-pan-view'
import { ROOT_APP_OUTLET } from '@/constants'
import { createRecoinStore } from '@/database/store'
import { GoogleIdentityProvider } from '@/integrations/google'
import { Sidebar } from '@/pages/app/(fragments)/sidebar'
import { Stage } from '@/pages/app/(fragments)/stage'
import Onboarding from '@/pages/app/auth/onboarding'
import StartPage from '@/pages/app/auth/start-page'
import { AuthenticationProvider } from '@/scopes/auth'
import { LiveStoreProvider } from '@/scopes/livestore'
import { useApplicationSetup } from '@/utilities/composables/use-application-setup'

const AppRoot = () => {
   const { ready, hasFinishedOnboarding } = useApplicationSetup()

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
      <FullScreenTransitionView
         class='grid-lines-with-fade min-h-screen select-none'
         when={ready}
         transition='fade-in'
         from={StartPage}
         to={() => (
            <VerticalPanView>
               {() => (
                  <LiveStoreProvider initStore={createRecoinStore} fallback={StoreLoadingFallback}>
                     {() => (
                        <FullScreenTransitionView
                           when={hasFinishedOnboarding}
                           transition='fade-in'
                           from={Onboarding}
                           to={() => (
                              <SidebarProviderView sidebar={Sidebar}>
                                 {() => (
                                    <Outlet
                                       id={ROOT_APP_OUTLET}
                                       class='h-full grid! translate-0 max-w-screen'
                                    />
                                 )}
                              </SidebarProviderView>
                           )}
                        />
                     )}
                  </LiveStoreProvider>
               )}
            </VerticalPanView>
         )}
      />
   )
}

const App = () => {
   return (
      <ToastProvider scheme='light'>
         {() => (
            <GoogleIdentityProvider>
               {() => <AuthenticationProvider>{AppRoot}</AuthenticationProvider>}
            </GoogleIdentityProvider>
         )}
      </ToastProvider>
   )
}

export default App
