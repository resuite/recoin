import Loader from '@/components/icons/svg/loader'
import RecoinBaseIcon from '@/components/icons/svg/recoin'
import { GoogleSignIn } from '@/components/ui/google-sign-in'
import { PullToRefreshView, SidebarProviderView } from '@/components/views'
import { FullScreenTransitionView } from '@/components/views/full-screen-transition-view'
import { Sidebar } from '@/pages/app/$fragments/sidebar'
import { type GoogleCredentialResponse, GoogleIdentityProvider } from '@/scopes/google'
import { useRouteQueryControl } from '@/utilities/composables'
import { Cell, If, useSetupEffect } from 'retend'
import { useRouter } from 'retend/router'

const Welcome = () => {
   const { add: logIn } = useRouteQueryControl('loggedIn')

   const handleSuccess = (_response: GoogleCredentialResponse) => {
      logIn()
   }
   const handleError = () => {}

   return (
      <>
         <div class='text-center grid place-items-center'>
            <RecoinBaseIcon class='h-2.5' />
            <h1 class='text-bigger'>Welcome to recoin.</h1>
         </div>
         <GoogleSignIn onSuccess={handleSuccess} onError={handleError} />
      </>
   )
}

const LoadingUserData = () => {
   const { add: logIn } = useRouteQueryControl('loggedIn')

   useSetupEffect(() => {
      const timeoutId = setTimeout(() => {
         logIn()
      }, 1300)

      return () => {
         clearTimeout(timeoutId)
      }
   })

   return <Loader class='h-2' />
}

const StartPage = () => {
   const isNewUser = Cell.source(true)
   return (
      <div class='grid place-items-center gap-1 place-content-center'>
         {If(isNewUser, {
            true: Welcome,
            false: LoadingUserData
         })}
      </div>
   )
}

const App = () => {
   const { hasKey: loggedIn } = useRouteQueryControl('loggedIn')

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

   return (
      <GoogleIdentityProvider>
         {() => (
            <FullScreenTransitionView
               when={loggedIn}
               transition='slide-up'
               from={StartPage}
               to={AppContent}
               class='grid-lines-with-fade'
            />
         )}
      </GoogleIdentityProvider>
   )
}

export default App
