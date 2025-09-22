import type { JSX } from 'retend/jsx-runtime'
import styles from './safe-area-view.module.css'

type DivProps = JSX.IntrinsicElements['div']
interface SafeAreaViewProps extends DivProps {}

export function SafeAreaView(props: SafeAreaViewProps) {
   return (
      <div class={styles.container}>
         <div {...props} />
      </div>
   )
}
