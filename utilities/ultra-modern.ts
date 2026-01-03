// Contains global types that are not yet bundled with typescript.

import type { KeyboardVisibilityEvent } from '@/components/virtual-keyboard-aware-view'

declare global {
   // Scroll timeline API
   type ScrollTimelineAxis = 'inline' | 'block'
   class ScrollTimeline extends AnimationTimeline {
      constructor(options: { source: Element; axis: ScrollTimelineAxis })
      readonly source: Element
      readonly axis: ScrollTimelineAxis
   }
   interface KeyframeAnimationOptions {
      rangeStart?: string
      rangeEnd?: string
   }

   //    Virtual Keyboard API
   interface VirtualKeyboard extends EventTarget {
      readonly boundingRect: DOMRectReadOnly
      overlaysContent: boolean
      show(): undefined
      hide(): undefined
      ongeometrychange: ((this: VirtualKeyboard, ev: Event) => void) | null
   }

   interface Navigator {
      readonly virtualKeyboard: VirtualKeyboard
   }

   interface HTMLElementEventMap {
      keyboardvisibilitychange: KeyboardVisibilityEvent
   }
}
