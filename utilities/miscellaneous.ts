import type { Cell } from 'retend'

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
   ? string[]
   : S extends ''
     ? []
     : S extends `${infer T}${D}${infer U}`
       ? [T, ...Split<U, D>]
       : [S]

export function vibrate() {
   navigator.vibrate?.([15, 15])
}

export interface PointerDownCoordinates {
   x: Cell<number>
   y: Cell<number>
}

/**
 * Finds the first focusable element within a given parent HTML element.
 * A focusable element is considered an input or button that is not disabled.
 *
 * @param parent The HTMLElement to search within.
 * @returns The first focusable HTMLElement found, or null if none is found.
 */
export function getFocusableElementInItem(parent: HTMLElement) {
   return parent.querySelector(':is(input, button):not(:disabled)') as HTMLElement | null
}
