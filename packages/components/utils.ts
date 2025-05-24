import { Cell } from "retend";

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
   Reflect.set(cell, "__promise", promise); // keeps the promise alive
   return cell;
}

/**
 * For time-lined animations (scroll or swipe), the animation duration
 * is 1000ms. However, on iOS, the animation resets to 0 if it reaches
 * the end frame. This is a workaround to avoid this issue.
 */
export const GESTURE_ANIMATION_MS = 999;

export function scrollTimelineFallback(element: HTMLElement) {
   if ("ScrollTimeline" in window) return;

   const scrollAnimation = element.getAnimations()[0];
   if (!scrollAnimation) return;
   scrollAnimation.pause();

   const scrollListener = () => {
      const { scrollLeft, scrollWidth, clientWidth } = element;
      const newTime = (scrollLeft / (scrollWidth - clientWidth)) *
         GESTURE_ANIMATION_MS;
      scrollAnimation.currentTime = newTime;
   };
   element.addEventListener("scroll", scrollListener, { passive: true });

   return () => {
      scrollAnimation.finish();
      element.removeEventListener("scroll", scrollListener);
   };
}

export function scrollTimelineFallbackBlock(element: HTMLElement) {
   if ("ScrollTimeline" in window) return;

   const scrollAnimation = element.getAnimations()[0];
   if (!scrollAnimation) return;
   scrollAnimation.pause();

   const scrollListener = () => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      const newTime = (scrollTop / (scrollHeight - clientHeight)) *
         GESTURE_ANIMATION_MS;
      scrollAnimation.currentTime = newTime;
   };
   element.addEventListener("scroll", scrollListener, { passive: true });

   return () => {
      scrollAnimation.finish();
      element.removeEventListener("scroll", scrollListener);
   };
}

export const defer = (fn: () => void) => setTimeout(fn, 0);

/**
 * Finds the nearest vertically scrollable container of an element (inclusive),
 * stopping the search if it reaches a boundary.
 *
 * @param {HTMLElement} element - The starting element
 * @param {HTMLElement} boundary - The element to stop the search at.
 * @returns {HTMLElement|null} - The nearest scrollable container or null if none found
 */
export function getScrollableY(
   element: HTMLElement,
   boundary: HTMLElement,
): HTMLElement | null {
   // If no element is provided, return null
   if (!element) return null;

   // Start checking from the provided element
   let current = element as HTMLElement | null;

   // Continue until we reach the boundary or null
   while (current && current !== document.body) {
      if (current === boundary) {
         // Stop searching when we hit a boundary
         return null;
      }

      // Check if the element is vertically scrollable
      const style = window.getComputedStyle(current);
      const overflowY = style.getPropertyValue("overflow-y");
      const hasVerticalScroll = ["auto", "scroll"].includes(overflowY) &&
         current.scrollHeight > current.clientHeight;

      // If the element has vertical scroll capability and room to scroll down
      if (
         hasVerticalScroll &&
         current.scrollTop < (current.scrollHeight - current.clientHeight)
      ) {
         return current;
      }

      // Move up to the parent element
      current = current.parentElement;
   }

   // Check if the body itself is scrollable
   if (
      document.body.scrollHeight > document.body.clientHeight &&
      document.body.scrollTop <
         (document.body.scrollHeight - document.body.clientHeight)
   ) {
      return document.body;
   }

   // No scrollable container found
   return null;
}

export interface PartitionOptions {
   /**
    * The number of partitions to have.
    */
   count?: number,
   /** 
    * Starting value of the CSS variable's range.
   */
   from?: number,
   /** 
    * Ending value of the CSS variable's range.
    */
   to?: number,
   /**
    * Overlap amount between partitions (0 - 1, where 0.5 is 50%)
    */
   overlap?: number,
   /**
    * The upper limit for a single partition.
    * Defaults to 1.
    */
   outputMin?: number,
   
   /**
    * The lower limit for a single partition.
    * Defaults to 0.
    */
   outputMax?: number,
}

/**
 * Creates CSS calc expressions that partition a CSS variable's range into sequential stages.
 * Each partition maps a portion of the input variable's range to a 0-1 output range.
 *
 * @param variable - The CSS variable name (e.g., 'var(--progress)')
 * @param options - Configuration options
 * @returns Array of CSS calc expressions, each representing a partition
 *
 * @example
 * // For a variable that goes 0-1, create 3 partitions
 * const [first, second, third] = createPartitions('var(--progress)', 3);
 * // Returns calc expressions where:
 * // - first: 0 → 1 when --progress goes 0 → 0.3333
 * // - second: 0 → 1 when --progress goes 0.3333 → 0.667
 * // - third: 0 → 1 when --progress goes 0.6667 → 1
 */
export function createPartitions(
   variable: string,
   options?: PartitionOptions,
) {
   const partitions = [];
   const { from: min = 0, to: max = 1, overlap = 0, outputMin = 0, outputMax = 1, count = 1 } = options ?? {};
   const totalRange = max - min;
   const outputRange = outputMax - outputMin;
   const basePartitionSize = totalRange / count;
   const partitionSize = basePartitionSize * (1 + overlap);
   const step = basePartitionSize * (1 - overlap);
   

   for (let i = 0; i < count; i++) {
      const start = min + (i * step);
      const normalizedCalc = 
         `clamp(0, (${variable} - ${start}) / ${partitionSize}, 1)`;
      const calc = `calc((${outputMin} + ${normalizedCalc}) * ${outputRange})`
      partitions.push(calc);
   }

   return partitions;
}
