import { Cell, createScope, useScopeContext } from 'retend'
import type { JSX } from 'retend/jsx-runtime'
import { Teleport, type TeleportProps } from 'retend/teleport'
import { useDerivedValue } from 'retend-utils/hooks'

const COLORS = {
   light: {
      className: 'light-scheme',
      gridLinesColor: 'rgb(39, 39, 39, 0.05)',
      gridBackgroundColor: 'white',
      canvasText: 'rgb(39, 39, 39)',
      canvasTextLighter: 'rgb(39, 39, 39, 0.75)',
      canvas: 'rgb(250, 255, 237)',
      canvasDeep: '#ffffff75',
      canvasBackground: 'white',
      canvasShadow: 'oklch(92.8% 0.006 264.531)'
   },
   dark: {
      className: 'dark-scheme',
      gridLinesColor: 'rgb(250, 255, 237, 0.05)',
      gridBackgroundColor: 'rgb(39, 39, 39',
      canvasText: 'rgb(250, 255, 237)',
      canvasTextLighter: 'rgb(250, 255, 237, 0.75)',
      canvasBackground: 'rgb(39, 39, 39)',
      canvas: 'rgb(39, 39, 39)',
      canvasDeep: '#232323',
      canvasShadow: '#151515'
   }
} as const satisfies Record<string, Omit<ThemeContext, 'scheme'>>

type ColorScheme = keyof typeof COLORS
const Theme = createScope<Cell<ThemeContext>>('Theme')

interface ThemeContext {
   scheme: ColorScheme
   className: string
   gridLinesColor: string
   gridBackgroundColor: string
   canvasText: string
   canvasTextLighter: string
   canvas: string
   canvasDeep: string
   canvasBackground: string
   canvasShadow: string
}

type DivProps = JSX.IntrinsicElements['div']
interface ThemeProviderProps extends DivProps {
   scheme: JSX.ValueOrCell<ColorScheme>
   children: (props: { value: Cell<ThemeContext> }) => JSX.Template
}

export function ThemeProvider(props: ThemeProviderProps) {
   const { children: Content, scheme: schemeProp, ...rest } = props
   const scheme = useDerivedValue(schemeProp)
   const value = Cell.derived((): ThemeContext => {
      const schemeValue = scheme.get()
      return { ...COLORS[schemeValue], scheme: schemeValue }
   })
   const schemeClass = Cell.derived(() => {
      return value.get().className
   })

   return (
      <Theme.Provider value={value}>
         {() => (
            <div {...rest} class={[schemeClass, rest.class, 'contents']} style={{}}>
               <Content value={value} />
            </div>
         )}
      </Theme.Provider>
   )
}

export function useThemeContext() {
   return useScopeContext(Theme)
}

export function ThemeAwareTeleport(props: TeleportProps) {
   const theme = useThemeContext()
   const schemeClass = Cell.derived(() => {
      return theme.get().className
   })

   return (
      <Teleport {...props} class={[schemeClass, props.class]}>
         {props.children}
      </Teleport>
   )
}
