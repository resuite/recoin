import { GOOGLE_CLIENT_ID, GOOGLE_SCRIPT_SRC } from '@/constants'
import { type Cell, createScope, useObserver, useScopeContext, useSetupEffect } from 'retend'
import type { JSX } from 'retend/jsx-runtime'

export type GoogleCredentialResponse = google.accounts.id.CredentialResponse
export type GoogleCredentialResponseHandler = (input: never) => Promise<GoogleCredentialResponse>

type ResolverObject = {
   resolve?: (value: GoogleCredentialResponse) => void
   reject?: () => void
}

interface GoogleAuthCtx {
   initializing: Promise<void> | null
   resolvers: Set<ResolverObject>
}

function loadGoogleScript() {
   return new Promise<void>((resolve, reject) => {
      let script = document.getElementById('google-identity') as HTMLScriptElement | null
      if (script) {
         resolve()
         return
      }

      script = document.createElement('script')
      script.src = GOOGLE_SCRIPT_SRC
      script.async = true
      script.defer = true
      script.id = 'google-identity'
      script.onload = () => {
         resolve()
      }
      script.onerror = () => {
         reject(new Error('Failed to load Google Identity script'))
      }
      document.head.appendChild(script)
   })
}

interface GoogleIdentityProviderProps {
   children: () => JSX.Template
}

interface GoogleCredentialHandlers {
   onSuccess: (response: GoogleCredentialResponse) => void
}

const GoogleAuthScope = createScope<GoogleAuthCtx>('GoogleAuth')

export function GoogleIdentityProvider(props: GoogleIdentityProviderProps) {
   const { children } = props
   const resolvers = new Set<ResolverObject>()

   const ctx: GoogleAuthCtx = {
      initializing: null,
      resolvers
   }

   useSetupEffect(() => {
      ctx.initializing = loadGoogleScript().then(() => {
         window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (response) => {
               for (const resolver of resolvers) {
                  resolver.resolve?.(response)
               }
               resolvers.clear()
            }
         })
      })
   })

   return <GoogleAuthScope.Provider value={ctx} content={children} />
}

export function useGoogleSignInButton(
   buttonRef: Cell<HTMLElement | null>,
   handlers: GoogleCredentialHandlers
) {
   const observer = useObserver()
   const scope = useScopeContext(GoogleAuthScope)

   useSetupEffect(() => {
      observer.onConnected(buttonRef, async (button) => {
         await scope.initializing
         window.google.accounts.id.prompt()
         scope.resolvers.add({ resolve: handlers.onSuccess })

         window.google.accounts.id.renderButton(button, {
            type: 'standard',
            size: 'large',
            logo_alignment: 'center',
            shape: 'circle',
            width: 300
         })
      })
   })
}
