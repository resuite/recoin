import { Cell } from 'retend'

export function useDerivedAsync<T>(
   initialValue: T,
   factory: () => Promise<T>
): Cell<T> {
   const cell = Cell.source<T>(initialValue)
   const promise = Cell.derived(() => {
      return { id: crypto.randomUUID(), promise: factory() }
   })
   promise.listen(async (value) => {
      try {
         cell.set(await value.promise)
      } catch (error) {
         // biome-ignore lint/suspicious/noConsole: utility.
         console.error(error)
      }
   })
   Reflect.set(cell, '__promise', promise) // keeps the promise alive
   return cell
}

/**
 * Defers execution of a function to the next event loop tick using setTimeout.
 * This allows other code to execute before the deferred function runs.
 *
 * @param fn The function to defer execution of
 * @returns The timeout ID that can be used to cancel the deferred execution
 */
export const defer = (fn: () => void) => setTimeout(fn, 0)

/**
 * Constrains a value between a minimum and maximum boundary.
 *
 * @param value The number to be clamped
 * @param min The lower boundary
 * @param max The upper boundary
 * @returns The value constrained between min and max
 */
export const clamp = (value: number, min: number, max: number) => {
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
