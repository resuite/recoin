import { appendChild, setAttributeFromProps } from 'retend'
import { getGlobalContext } from 'retend/context'
import type { JSX } from 'retend/jsx-runtime'
import styles from './safe-area-view.module.css'

type DivProps = JSX.IntrinsicElements['div']

interface SafeAreaViewProps<ElementName extends keyof JSX.IntrinsicElements> extends DivProps {
   elementName?: ElementName
}

export function SafeAreaView<ElementName extends keyof JSX.IntrinsicElements>(
   props: SafeAreaViewProps<ElementName>
) {
   const { window } = getGlobalContext()
   const { elementName = 'div', ..._rest } = props
   const rest = _rest as unknown as Record<string, unknown>
   const element = window.document.createElement(elementName)
   for (const [key, value] of Object.entries(rest)) {
      setAttributeFromProps(element, key, value)
   }
   appendChild(element, element.tagName.toLowerCase(), props.children)

   return <div class={styles.container}>{element}</div>
}
