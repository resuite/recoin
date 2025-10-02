import Loader from '@/components/icons/svg/loader'
import { FullScreenTransitionView } from '@/components/views/full-screen-transition-view'
import { SidebarProviderView } from '@/components/views/sidebar-provider-view'
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
import { If } from 'retend'
import { useRouter } from 'retend/router'

const AppContent = () => {
   const { Outlet } = useRouter()
   const { hasFinishedOnboarding } = useApplicationSetup()

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
                  <SidebarProviderView class='dark-scheme select-none' sidebar={() => <Sidebar />}>
                     {() => (
                        <Outlet
                           id={ROOT_APP_OUTLET}
                           style={{ display: 'grid' }}
                           class='h-full translate-0'
                        />
                     )}
                  </SidebarProviderView>
               )}
            />
         )}
      </LiveStoreProvider>
   )
}

const AppRoot = () => {
   const { ready } = useApplicationSetup()
   return (
      <FullScreenTransitionView
         when={ready}
         transition='fade-in'
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
