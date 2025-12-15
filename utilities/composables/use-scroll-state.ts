import { Cell, useObserver } from 'retend'
import { Flags } from '@/constants/flags'
import type { ContainerRef } from '../miscellaneous'

interface ScrollState {
   atTop: Cell<boolean>
   atBottom: Cell<boolean>
   atLeft: Cell<boolean>
   atRight: Cell<boolean>
}

export function useScrollState(containerRef: ContainerRef): ScrollState {
   const atTop = Cell.source(false)
   const atBottom = Cell.source(false)
   const atLeft = Cell.source(false)
   const atRight = Cell.source(false)
   const observer = useObserver()

   if (!Flags.Runtime.Supports.ScrollTimeline) {
      return { atTop, atBottom, atLeft, atRight }
   }

   function handleAnimationStart(this: HTMLElement, event: AnimationEvent) {
      if (event.target !== this) {
         return
      }
      if (event.animationName.includes('scrolled-to-top-detector')) {
         atTop.set(true)
      } else if (event.animationName.includes('scrolled-to-bottom-detector')) {
         atBottom.set(true)
      } else if (event.animationName.includes('scrolled-to-left-detector')) {
         atLeft.set(true)
      } else if (event.animationName.includes('scrolled-to-right-detector')) {
         atRight.set(true)
      }
   }

   function handleAnimationEnd(this: HTMLElement, event: AnimationEvent) {
      if (event.target !== this) {
         return
      }
      if (event.animationName.includes('scrolled-to-top-detector')) {
         atTop.set(false)
      } else if (event.animationName.includes('scrolled-to-bottom-detector')) {
         atBottom.set(false)
      } else if (event.animationName.includes('scrolled-to-left-detector')) {
         atLeft.set(false)
      } else if (event.animationName.includes('scrolled-to-right-detector')) {
         atRight.set(false)
      }
   }

   observer.onConnected(containerRef, (container) => {
      container.addEventListener('animationstart', handleAnimationStart)
      container.addEventListener('animationend', handleAnimationEnd)

      return () => {
         container.removeEventListener('animationstart', handleAnimationStart)
         container.removeEventListener('animationend', handleAnimationEnd)
      }
   })

   return { atTop, atBottom, atLeft, atRight }
}
