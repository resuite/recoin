import { Cell, useObserver } from 'retend'

export function useTextContentLength(ref: Cell<HTMLElement | null>): Cell<number> {
   const observer = useObserver()
   const count = Cell.source(0)

   observer.onConnected(ref, (element) => {
      const update = () => {
         // This should be element.innerText, to cater for hidden text
         // and such, but element.innerText causes too many reflows and
         // cracks the initial slide-up animation.
         count.set(element.textContent?.length ?? 0)
      }
      update()
      const observer = new MutationObserver(update)
      observer.observe(element, {
         characterData: true,
         childList: true,
         subtree: true
      })

      return () => observer.disconnect()
   })

   return count
}
