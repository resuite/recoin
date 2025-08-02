import { Cell } from 'retend'
import { createGlobalStateHook } from 'retend-utils/hooks'

export function useDerivedAsync<T>(initialValue: T, factory: () => Promise<T>): Cell<T> {
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

export const usePointerDownCoordinates = createGlobalStateHook({
   cacheKey: Symbol('usePointerDownCoordinates'),
   createSource: () => ({ x: Cell.source(0), y: Cell.source(0) }),
   setupListeners: (window, cells) => {
      const updatePosition = (event: PointerEvent) => {
         Cell.batch(() => {
            cells.x.set(event.clientX)
            cells.y.set(event.clientY)
         })
      }
      window.addEventListener('pointerdown', updatePosition, { passive: true })
   },
   createReturnValue: (cells): PointerDownCoordinates => ({
      x: Cell.derived(() => cells.x.get()),
      y: Cell.derived(() => cells.y.get())
   })
})

export const useDocumentVisibility = createGlobalStateHook({
   cacheKey: Symbol('useDocumentVisibility'),
   createSource: () => Cell.source(true),
   setupListeners: (window, isVisible) => {
      const { document } = window
      const handleVisibilityChange = () => {
         isVisible.set(document.visibilityState === 'visible')
      }
      document.addEventListener('visibilitychange', handleVisibilityChange)
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
   },
   createReturnValue: (isVisible): Cell<boolean> => Cell.derived(() => isVisible.get())
})

export const usePointerPosition = createGlobalStateHook({
   cacheKey: Symbol('useCursorPosition'),
   createSource: () => ({ x: Cell.source(0), y: Cell.source(0) }),
   setupListeners: (window, cells) => {
      const updatePosition = (event: PointerEvent) => {
         cells.x.set(event.clientX)
         cells.y.set(event.clientY)
      }
      window.addEventListener('pointermove', updatePosition, { passive: true })
      window.addEventListener('pointerdown', updatePosition, { passive: true })
   },
   createReturnValue: (cells) => ({
      x: Cell.derived(() => cells.x.get()),
      y: Cell.derived(() => cells.y.get())
   })
})
