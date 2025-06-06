import { Cell } from 'retend';

export function useDerivedAsync<T>(
   initialValue: T,
   factory: () => Promise<T>,
): Cell<T> {
   const cell = Cell.source<T>(initialValue);
   const promise = Cell.derived(() => {
      return { id: crypto.randomUUID(), promise: factory() };
   });
   promise.listen(async (value) => {
      try {
         cell.set(await value.promise);
      } catch (error) {
         console.error(error);
      }
   });
   Reflect.set(cell, '__promise', promise); // keeps the promise alive
   return cell;
}

/**
 * Defers execution of a function to the next event loop tick using setTimeout.
 * This allows other code to execute before the deferred function runs.
 *
 * @param fn The function to defer execution of
 * @returns The timeout ID that can be used to cancel the deferred execution
 */
export const defer = (fn: () => void) => setTimeout(fn, 0);
