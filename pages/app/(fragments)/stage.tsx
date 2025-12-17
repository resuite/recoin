import type { JSX } from 'retend/jsx-runtime'
import { ThemeProvider } from '@/scopes/theme'

type DivProps = JSX.IntrinsicElements['div']
interface StageProps extends DivProps {
   children: () => JSX.Template
}

export const Stage = (props: StageProps) => {
   const { children: Content, ...rest } = props

   return (
      <ThemeProvider scheme='light'>
         {() => (
            <div
               {...rest}
               class={[
                  'pt-(--safe-area-inset-top)',
                  'translate-0 h-full bg-canvas max-w-screen',
                  'duration-bit-slower transition-transform ease',

                  props.class
               ]}
            >
               <Content />
            </div>
         )}
      </ThemeProvider>
   )
}
