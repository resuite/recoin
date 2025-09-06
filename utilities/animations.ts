import { Cell } from 'retend'
import { defer } from './miscellaneous'

export interface PartitionOptions {
   /**
    * The number of partitions to have.
    */
   count?: number
   /**
    * Starting value of the CSS variable's range.
    */
   from?: number
   /**
    * Ending value of the CSS variable's range.
    */
   to?: number
   /**
    * Overlap amount between partitions (0 - 1, where 0.5 is 50%)
    */
   overlap?: number
   /**
    * The upper limit for a single partition.
    * Defaults to 1.
    */
   outputMin?: number

   /**
    * The lower limit for a single partition.
    * Defaults to 0.
    */
   outputMax?: number
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
 * const [first, second, third] = createPartitions('var(--progress)', { count: 3 });
 * // Returns calc expressions where:
 * // - first: 0 → 1 when --progress goes 0 → 0.3333
 * // - second: 0 → 1 when --progress goes 0.3333 → 0.667
 * // - third: 0 → 1 when --progress goes 0.6667 → 1
 */
export function createPartitions(variable: string, options?: PartitionOptions): string[] {
   const partitions: string[] = []
   const {
      from: min = 0,
      to: max = 1,
      overlap = 0,
      outputMin = 0,
      outputMax = 1,
      count = 1
   } = options ?? {}
   const totalRange = max - min
   const outputRange = outputMax - outputMin
   const basePartitionSize = totalRange / count
   const partitionSize = basePartitionSize * (1 + overlap)
   const step = basePartitionSize * (1 - overlap)

   for (let i = 0; i < count; i++) {
      const start = min + i * step
      const normalizedCalc = `clamp(0, (${variable} - ${start}) / ${partitionSize}, 1)`
      const calc = `calc((${outputMin} + ${normalizedCalc}) * ${outputRange})`
      partitions.push(calc)
   }

   return partitions
}

/**
 * Retrieves the running animations on an element and returns
 * a promise that resolves when they are all settled.
 *
 * NOTE: It waits till the next cycle of the event loop, so as to
 * collect animations started by style changes in this cycle.
 * @param el The element to track animations on.
 */
export function animationsSettled(el: HTMLElement | Cell<HTMLElement | null>) {
   let resolver: (() => void) | null = null
   const promise = new Promise<void>((resolve) => {
      resolver = resolve
   })
   defer(async () => {
      const element = Cell.isCell(el) ? el.peek() : el
      if (!element) {
         resolver?.()
         return
      }
      const animations = element.getAnimations()
      const animationPromises = animations.map((a) => {
         return a.finished
      })
      await Promise.allSettled(animationPromises)
      resolver?.()
   })
   return promise
}
