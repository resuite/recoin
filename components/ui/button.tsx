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
      let currentAnimation: Animation | null = null
      let rippleState: { x: number; y: number; diameter: number } | null = null

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

         rippleState = { x, y, diameter }
         currentAnimation?.cancel()
         currentAnimation = ripple.animate(
            [
               { transform: `translate(${x}px, ${y}px) scale(${diameter * 0.4})`, opacity: 0 },
               {
                  transform: `translate(${x}px, ${y}px) scale(${diameter * 0.6})`,
                  opacity: 0.16,
                  offset: 0.15
               },
               { transform: `translate(${x}px, ${y}px) scale(${diameter})`, opacity: 0.16 }
            ],
            { duration: 300, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' }
         )
      }

      const handlePointerUp = async () => {
         const ripple = spanRef.get()
         const expandAnimation = currentAnimation
         const state = rippleState
         if (!ripple || !state) {
            return
         }

         rippleState = null
         if (expandAnimation) {
            await expandAnimation.finished
         }
         const { x, y, diameter } = state
         currentAnimation = ripple.animate(
            [
               { transform: `translate(${x}px, ${y}px) scale(${diameter})`, opacity: 0.16 },
               { transform: `translate(${x}px, ${y}px) scale(${diameter})`, opacity: 0 }
            ],
            { duration: 300, easing: 'ease-out', fill: 'forwards' }
         )
      }

      observer.onConnected(ref, (button) => {
         button.addEventListener('pointerdown', handlePointerDown, { passive: true })
         button.addEventListener('pointerup', handlePointerUp, { passive: true })
         button.addEventListener('pointerleave', handlePointerUp, { passive: true })
         button.addEventListener('pointercancel', handlePointerUp, { passive: true })
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
