import { Cell, If, useObserver } from 'retend'
import type { JSX } from 'retend/jsx-runtime'
import { useDerivedValue } from 'retend-utils/hooks'
import { Flags } from '@/constants/flags'
import { Platform } from '@/utilities/browser'
import { PointerTracker } from '@/utilities/pointer-gesture-tracker'
import styles from './button.module.css'

type IntrinsicButtonProps = JSX.IntrinsicElements['button']

interface ButtonProps extends IntrinsicButtonProps {
   trackClickedState?: JSX.ValueOrCell<boolean>
   ref?: Cell<HTMLButtonElement | null>
}

const isAndroid = Flags.OS.Name === Platform.Android
export function Button(props: ButtonProps) {
   const {
      type = 'button',
      class: className,
      trackClickedState: trackClickedStateProp,
      ref = Cell.source(null),
      children,
      ...rest
   } = props

   const trackClickedState = useDerivedValue(trackClickedStateProp)
   const spanRef = Cell.source<HTMLSpanElement | null>(null)
   const observer = useObserver()

   if (trackClickedState.get() && !isAndroid) {
      addClickTracker(ref, trackClickedState)
   }

   if (isAndroid) {
      const handlePointerDown = (event: PointerEvent) => {
         const ripple = spanRef.get()
         const button = ref.get()
         if (!ripple || !button) {
            return
         }

         const rect = button.getBoundingClientRect()
         const x = event.offsetX
         const y = event.offsetY
         const maxDistX = Math.max(x, rect.width - x)
         const maxDistY = Math.max(y, rect.height - y)
         const diameter = Math.sqrt(maxDistX ** 2 + maxDistY ** 2) * 2

         ripple.animate(
            [
               { transform: `translate(${x}px, ${y}px) scale(0)`, opacity: 0.3 },
               { transform: `translate(${x}px, ${y}px) scale(${diameter})`, opacity: 0 }
            ],
            { duration: 400, easing: 'ease-out' }
         )
      }

      observer.onConnected(ref, (button) => {
         button.addEventListener('pointerdown', handlePointerDown, { passive: true })
      })
   }

   return (
      <button {...rest} ref={ref} type={type} class={[styles.button, className]}>
         {children}
         {If(isAndroid, () => (
            <span class={styles.ripple} ref={spanRef} />
         ))}
      </button>
   )
}

function addClickTracker(ref: Cell<HTMLElement | null>, shouldTrack: Cell<boolean | undefined>) {
   let timeout: ReturnType<typeof setTimeout> | undefined
   const observer = useObserver()

   // I have noticed a weird delay when it comes to the click event
   // on touch screens. Not sure of the cause, but tracking pointer state
   // just before the click event gives a more immediate feel.
   function handlePointerDown(this: HTMLElement, event: PointerEvent) {
      setClickedState(this)
      const tracker = new PointerTracker()
      tracker.start(event)
      requestAnimationFrame(() => {
         if (tracker.hasMoved) {
            clearTimeout(timeout)
            this?.removeAttribute('data-clicked')
         }
      })
   }

   function setClickedState(button: HTMLElement | null) {
      if (timeout) {
         clearTimeout(timeout)
      }
      button?.setAttribute('data-clicked', 'true')
      timeout = setTimeout(() => {
         timeout = undefined
         button?.removeAttribute('data-clicked')
      }, 250)
   }

   function handleMissedEvents(this: HTMLButtonElement) {
      if (!timeout && !this.hasAttribute('data-clicked')) {
         setClickedState(this)
      }
   }

   observer.onConnected(ref, (button) => {
      shouldTrack.runAndListen((shouldTrackClickedState) => {
         if (shouldTrackClickedState) {
            button.addEventListener('pointerdown', handlePointerDown)
            button.addEventListener('click', handleMissedEvents)
         } else {
            button.removeEventListener('pointerdown', handlePointerDown)
            button.removeEventListener('click', handleMissedEvents)
         }
      })

      return () => {
         button.removeEventListener('pointerdown', handlePointerDown)
         button.removeEventListener('click', handleMissedEvents)
      }
   })
}
