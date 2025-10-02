import { VibrationPatterns } from '@/constants/vibration'

/**
 * Defers execution of a function to the next event loop tick using setTimeout.
 * This allows other code to execute before the deferred function runs.
 *
 * @param fn The function to defer execution of
 * @returns The timeout ID that can be used to cancel the deferred execution
 */
export function defer(fn: () => void) {
   return setTimeout(fn, 0)
}

/**
 * Constrains a value between a minimum and maximum boundary.
 *
 * @param value The number to be clamped
 * @param min The lower boundary
 * @param max The upper boundary
 * @returns The value constrained between min and max
 */
export function clamp(value: number, min: number, max: number) {
   return Math.max(min, Math.min(value, max))
}

/**
 * Recursively splits a string into an array of substrings based on a delimiter.
 *
 * @typeParam S - The input string to be split
 * @typeParam D - The delimiter used to split the string
 * @returns An array of substrings, or a string array if the input is a generic string
 *
 * @example
 * type Result = Split<'a.b.c', '.'> // ['a', 'b', 'c']
 * type EmptyResult = Split<'', '.'> // []
 */
export type Split<S extends string, D extends string> = string extends S
   ? Array<string>
   : S extends ''
     ? []
     : S extends `${infer T}${D}${infer U}`
       ? [T, ...Split<U, D>]
       : [S]

export function vibrate(pattern?: VibratePattern) {
   navigator.vibrate?.(pattern ?? VibrationPatterns.Default)
}

/**
 * Finds the first focusable element within a given parent HTML element.
 * A focusable element is considered an input or button that is not disabled.
 *
 * @param parent The HTMLElement to search within.
 * @returns The first focusable HTMLElement found, or null if none is found.
 */
export function getFocusableElementInItem(parent: Element) {
   return parent.querySelector(':is(input, button):not(:disabled)') as HTMLElement | null
}

/**
 * Ensures immediate action by prioritizing the initial pointer event.
 * Prevents redundant triggers from subsequent click events for a more responsive feel.
 *
 * @param handler - The action to execute immediately.
 * @returns An event handler that triggers the action on the first pointer interaction.
 */
export function createPointerOrClickHander(handler: () => void) {
   return (event: Event) => {
      const target = event.currentTarget as HTMLButtonElement
      if (event.type === 'pointerdown') {
         // Prevents click from firing, given that pointerdown has already been fired.
         const preventDblClick = (event: Event) => {
            event.preventDefault()
         }
         target.addEventListener('click', preventDblClick, { capture: true, once: true })
         defer(() => {
            target.removeEventListener('click', preventDblClick)
         })
      }

      if (event.defaultPrevented) {
         return
      }

      handler()
   }
}

const OFFSET_FROM_KEYBOARD = 30

function getOffsetFromScrollTop(element: HTMLElement, scrollContainer: HTMLElement): number {
   const elementRect = element.getBoundingClientRect()
   const containerRect = scrollContainer.getBoundingClientRect()

   return elementRect.top - containerRect.top + scrollContainer.scrollTop
}

/**
 * Scrolls a target element into view within a scrollable parent element.
 * The target element will be centered vertically in the scroll view, with an additional offset.
 *
 * @param target The HTMLElement to scroll into view.
 * @param scrollView The HTMLElement that is scrollable.
 */
export function scrollIntoView(target: HTMLElement, scrollView: HTMLElement) {
   const { clientHeight: scrollViewClientHeight } = scrollView
   const { clientHeight } = target
   const top =
      getOffsetFromScrollTop(target, scrollView) +
      clientHeight -
      scrollViewClientHeight / 2 +
      OFFSET_FROM_KEYBOARD
   scrollView.scrollTo({ top, behavior: 'smooth' })
}

/**
 * Merges a Date object with a time string (HH:MM) to create a new Date object.
 * The time components (hours and minutes) from the time string are applied to the date.
 *
 * @param date The Date object to merge with.
 * @param time A string representing the time in HH:MM format.
 * @returns A new Date object with the date from the input `date` and the time from the input `time`.
 */
export function mergeDateAndTime(date: Date, time: string): Date {
   const newDate = new Date(date)
   const [hours, minutes] = time.split(':').map(Number)
   newDate.setHours(hours, minutes, 0, 0)
   return newDate
}

export function tryFn<T>(func: () => T): T | undefined {
   try {
      return func()
   } catch {
      return undefined
   }
}
