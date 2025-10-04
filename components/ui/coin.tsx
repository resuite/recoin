import { Icon, type IconName } from '@/components/icons'
import Sparkle from '@/components/icons/svg/sparkle'
import { animationsSettled } from '@/utilities/animations'
import { Cell, useObserver } from 'retend'
import type { JSX } from 'retend/jsx-runtime'
import styles from './coin.module.css'

type DivProps = JSX.IntrinsicElements['div']
interface CoinProps extends DivProps {
   size?: JSX.ValueOrCell<string>
   icon: IconName
   spinning?: boolean
   /**
    * Callback to be called when the coin stops spinning.
    */
   onSettled?: () => void
   /**
    * The ref to the coin element.
    */
   ref?: Cell<HTMLElement | null>
}

export function Coin(props: CoinProps) {
   const {
      class: className,
      icon,
      spinning,
      size = 'calc(var(--spacing) * 6)',
      ref = Cell.source<HTMLElement | null>(null),
      onSettled,
      ...rest
   } = props
   const observer = useObserver()

   const style = {
      '--min-size': size
   }

   observer.onConnected(ref, async (coin) => {
      await animationsSettled(coin)
      coin.classList.add(styles.settled)
      onSettled?.()
   })

   return (
      <animated-coin
         {...rest}
         ref={ref}
         class={[styles.coin, { [styles.spinning]: spinning }, className]}
         style={style}
      >
         <div class={styles.shimmer} />
         <Sparkle class={[styles.sparkle, styles.topSparkle]} />
         <div class={styles.heads}>
            <Icon name={icon} class={styles.icon} />
         </div>
         <div class={styles.headBackface} />
         <div class={styles.tailsBackface} />
         <div class={styles.tails}>
            <Icon name={icon} class={styles.icon} />
         </div>
         <Sparkle class={[styles.sparkle, styles.bottomSparkle]} />
      </animated-coin>
   )
}
