import { h } from 'retend'
import type { JSX } from 'retend/jsx-runtime'
import styles from './safe-area-view.module.css'

interface SafeAreaViewProps<ElementName extends keyof JSX.IntrinsicElements>
   extends JSX.BaseContainerProps {
   elementName?: ElementName
   containerClass?: unknown
}

export function SafeAreaView<ElementName extends keyof JSX.IntrinsicElements>(
   props: SafeAreaViewProps<ElementName>
) {
   const { containerClass, elementName = 'div', ...rest } = props
   return <div class={[styles.container, containerClass]}>{h(elementName, rest)}</div>
}
