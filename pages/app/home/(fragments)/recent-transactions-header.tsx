import Add from '@/components/icons/svg/add'
import Search from '@/components/icons/svg/search'
import { Button } from '@/components/ui/button'
import {
   type StickStateChangeEvent,
   type StickTimelineRangeSetEvent,
   Sticky
} from '@/components/ui/sticky'
import { useScrollTimelineContext } from '@/components/views/scroll-timeline-view'
import { QueryKeys } from '@/constants/query-keys'
import { useRouteQueryControl } from '@/utilities/composables/use-route-query-control'
import { defer } from '@/utilities/miscellaneous'
import { Cell, If, useSetupEffect } from 'retend'
import { Input } from 'retend-utils/components'
import { useIntersectionObserver } from 'retend-utils/hooks'

export const RecentTransactionsHeader = () => {
   const stuck = Cell.source(false)
   const timeline = useScrollTimelineContext()
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

   const toggleSearch = () => {
      if (searchIsOpen.get()) {
         closeSearch()
      } else {
         openSearch()
      }
   }

   const handleStickStateChange = (event: StickStateChangeEvent) => {
      stuck.set(event.wasStuck)
   }

   const handleStickTimelineRangeSet = (event: StickTimelineRangeSetEvent) => {
      if (spanAnimationController) {
         spanAnimationController.abort()
      }
      spanAnimationController = new AbortController()
      timeline.add({
         target: spanRef,
         keyframes: {
            scale: ['1', '1.25'],
            translate: ['0px 20%', 'calc(-50dvw + 50% + var(--spacing))']
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
         relativeTopOfStickyArea?.scrollIntoView({ block: 'start' })
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
      defer(() => searchInputRef.peek()?.focus())
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
         <Sticky
            onStickStateChange={handleStickStateChange}
            onStickTimelineRangeSet={handleStickTimelineRangeSet}
         >
            <h4
               class={[
                  'text-center px-1 grid grid-cols-1 *:[grid-area:1/1]',
                  'before:content before:h-full before:scale-y-[1.6] before:[grid-area:1/1] before:self-end',
                  'before:origin-top-left',
                  'before:bg-linear-to-b before:from-canvas-background before:from-70% before:to-transparent',
                  'before:opacity-0',
                  {
                     'before:opacity-100!': stuck,
                     'before:hidden': searchIsOpen
                  }
               ]}
            >
               <span
                  ref={spanRef}
                  class={[
                     'origin-left will-change-[translate,scale] duration-slow transition-opacity',
                     'inline-block py-0.5 w-fit justify-self-center text-lg',
                     { 'opacity-0': searchIsOpen }
                  ]}
               >
                  Recent Transactions
               </span>
               <Button
                  class={[
                     'duration-bit-slower transition-[opacity,translate]',
                     'button-bare z-2 opacity-0 translate-y-0.5 ease-out justify-self-end self-center',
                     { 'opacity-100 translate-y-0!': stuck }
                  ]}
                  onClick={toggleSearch}
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
