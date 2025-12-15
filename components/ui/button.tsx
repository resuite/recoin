import { Cell, useObserver } from 'retend'
import type { JSX } from 'retend/jsx-runtime'
import { useDerivedValue } from 'retend-utils/hooks'
import { PointerTracker, type TrackedEndedEvent } from '@/utilities/pointer-gesture-tracker'
import styles from './button.module.css'

type IntrinsicButtonProps = JSX.IntrinsicElements['button']

interface ButtonProps extends IntrinsicButtonProps {
   trackClickedState?: JSX.ValueOrCell<boolean>
   ref?: Cell<HTMLButtonElement | null>
}

export function Button(props: ButtonProps) {
   const {
      type = 'button',
      class: className,
      trackClickedState: trackClickedStateProp,
      ref = Cell.source(null),
      ...rest
   } = props
   const trackClickedState = useDerivedValue(trackClickedStateProp)

   if (trackClickedState.get()) {
      addClickTracker(ref, trackClickedState)
   }

   return <button {...rest} ref={ref} type={type} class={[styles.button, className]} />
}

function addClickTracker(ref: Cell<HTMLElement | null>, shouldTrack: Cell<boolean | undefined>) {
   let timeout: ReturnType<typeof setTimeout> | undefined
   const observer = useObserver()

   // I have noticed a weird delay when it comes to the click event
   // on touch screens. Not sure of the cause, but tracking pointer state
   // just before the click event gives a more immediate feel.
   function handlePointerDown(this: HTMLElement, event: PointerEvent) {
      const tracker = new PointerTracker()
      tracker.start(event)
      this.setAttribute('data-clicked', 'true')
      tracker.addEventListener(
         'move',
         () => {
            this.removeAttribute('data-clicked')
         },
         { once: true }
      )
      tracker.addEventListener('end', handleTrackingEnd)
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

   function handleTrackingEnd(this: PointerTracker, event: TrackedEndedEvent) {
      const { pointerCancelled, lastPointerEvent } = event
      const { startingEvent } = this
      if (pointerCancelled) {
         return
      }
      const button = ref.peek()
      const isStationaryGesture =
         lastPointerEvent &&
         Math.abs(startingEvent.clientX - lastPointerEvent.clientX) <= 5 &&
         Math.abs(startingEvent.clientY - lastPointerEvent.clientY) <= 5

      if (!isStationaryGesture) {
         return
      }

      setClickedState(button)
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
