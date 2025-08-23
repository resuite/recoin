import { Cell } from 'retend'

export function createLinkAnimationValues(progressValue: string) {
   const translate = Cell.derived(() => {
      return `calc(-15% + ${progressValue} * 15%)`
   })

   const opacity = Cell.derived(() => {
      return progressValue
   })

   return { translate, opacity }
}
