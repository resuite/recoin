import { Cell, If, useSetupEffect } from 'retend'
import { useIntersectionObserver } from 'retend-utils/hooks'
import Add from '@/components/icons/svg/add'
import Search from '@/components/icons/svg/search'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { type StickTimelineRangeSetEvent, Sticky } from '@/components/ui/sticky'
import { useScrollTimeline } from '@/components/views/scroll-view'
import { QueryKeys } from '@/constants/query-keys'
import { useRouteQueryControl } from '@/utilities/composables/use-route-query-control'
import { createPointerOrClickHandler, defer } from '@/utilities/miscellaneous'

export const RecentTransactionsHeader = () => {
   const timeline = useScrollTimeline()
   const {
      add: openSearch,
      remove: closeSearch,
      hasKey: searchIsOpen
   } = useRouteQueryControl(QueryKeys.RecentTransactions.SearchIsOpen)
   const spanRef = Cell.source<HTMLSpanElement | null>(null)
   const searchInputRef = Cell.source<HTMLInputElement | null>(null)
   const relativeTopOfStickyAreaRef = Cell.source<HTMLElement | null>(null)

   let spanAnimationController: AbortController | null = null
   let relativeTopIsIntersecting = false
   let scheduleEffectsForNextRelativeTopIntersection = false

   const toggleSearch = createPointerOrClickHandler(() => {
      if (searchIsOpen.get()) {
         closeSearch()
      } else {
         openSearch()
      }
   })

   const handleStickTimelineRangeSet = (event: StickTimelineRangeSetEvent) => {
      if (spanAnimationController) {
         spanAnimationController.abort()
      }
      spanAnimationController = new AbortController()
      timeline.add({
         target: spanRef,
         keyframes: {
            scale: ['1', '1.3'],
            translate: ['0px min(2.75dvh,50px)', 'calc(50% - 50dvw + var(--spacing) * 2) 0px']
         },
         range: { start: event.start, end: event.end },
         signal: spanAnimationController.signal
      })
   }

   const focusSearchStateIfOpen = () => {
      if (searchIsOpen.get()) {
         // This repositions the listing underneath to align with the start
         // of the scroll container, while the sticky header is unmoved. We cannot
         // use scrollContainer.scrollTo(sticky.offsetTop), because
         // it is absolutely positioned.
         const relativeTopOfStickyArea = relativeTopOfStickyAreaRef.peek()
         relativeTopOfStickyArea?.scrollIntoView({ block: 'start', behavior: 'smooth' })
         // We want to lock the outer scroll view when search is open,
         // but Safari fails yet again, because:
         // - If we lock before scrolling finishes, it cancels out, so
         // we need to wait for scrolling to end.
         // - No support for the scrollend event, so we cannot know when scrolling ends.
         //
         // We fallback to our favorite hack, the intersection observer. when the sticky area
         // enters the viewport, we assume that scrolling into view
         // has ended and we can safely lock.
         if (!relativeTopIsIntersecting) {
            scheduleEffectsForNextRelativeTopIntersection = true
         } else {
            handleSearchOpenSideEffects()
         }
      } else {
         scheduleEffectsForNextRelativeTopIntersection = false
         timeline.unlock()
      }
   }

   const handleSearchOpenSideEffects = () => {
      timeline.lock()
      defer(() => {
         searchInputRef.peek()?.focus()
      })
   }

   searchIsOpen.listen(focusSearchStateIfOpen)

   useIntersectionObserver(relativeTopOfStickyAreaRef, ([entry]) => {
      relativeTopIsIntersecting = entry.isIntersecting
      if (entry.isIntersecting && scheduleEffectsForNextRelativeTopIntersection) {
         scheduleEffectsForNextRelativeTopIntersection = false
         handleSearchOpenSideEffects()
      }
   })

   useSetupEffect(() => {
      focusSearchStateIfOpen()

      return () => {
         spanAnimationController?.abort()
      }
   })

   return (
      <>
         {/* Can't explain the logic behind the zero-height and translation. It just works. */}
         <div ref={relativeTopOfStickyAreaRef} class='h-0 scroll-mt-px translate-y-[10px]' />
         <Sticky animated onStickTimelineRangeSet={handleStickTimelineRangeSet}>
            <h4 class='text-center font-medium px-1 pb-0.5 grid grid-cols-1 *:[grid-area:1/1] bg-canvas-background'>
               <span
                  ref={spanRef}
                  class={[
                     'will-change-[translate,scale] duration-slow transition-opacity',
                     'inline-block py-0.5 w-fit justify-self-center text-lg',
                     'translate-y-[min(2.75dvh,50px)]',
                     { 'opacity-0': searchIsOpen }
                  ]}
               >
                  Recent Transactions
               </span>
               <Button
                  class={[
                     'duration-bit-slower transition-[opacity,translate]',
                     'button-bare z-2 opacity-0 translate-y-0.5 ease-out justify-self-end self-center',
                     'stuck:opacity-100 stuck:translate-y-0!'
                  ]}
                  onClick={toggleSearch}
                  onPointerDown={toggleSearch}
               >
                  {If(searchIsOpen, {
                     true: () => <Add class='h-1 w-1 [&_path]:stroke-3 rotate-45' />,
                     false: () => <Search class='h-1 w-1 [&_path]:stroke-2' />
                  })}
               </Button>
               {If(searchIsOpen, () => (
                  <Input
                     ref={searchInputRef}
                     class='w-full bg-canvas-background z-1 focus-within:outline-0'
                     placeholder='Search...'
                  />
               ))}
            </h4>
         </Sticky>
      </>
   )
}
