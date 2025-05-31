/**
 * For time-lined animations (scroll or swipe), the animation duration
 * is 1000ms. However, on iOS, the animation resets to 0 if it reaches
 * the end frame. This is a workaround to avoid this issue.
 */
export const GESTURE_ANIMATION_MS = 999;

export function scrollTimelineFallbackBlock(element: HTMLElement) {
   if ("ScrollTimeline" in window) return;

   const scrollAnimation = element.getAnimations()[0];
   if (!scrollAnimation) return;
   scrollAnimation.pause();

   const scrollListener = () => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      const newTime =
         (scrollTop / (scrollHeight - clientHeight)) * GESTURE_ANIMATION_MS;
      scrollAnimation.currentTime = newTime;
   };
   element.addEventListener("scroll", scrollListener, { passive: true });

   return () => {
      scrollAnimation.finish();
      element.removeEventListener("scroll", scrollListener);
   };
}

export function scrollTimelineFallback(element: HTMLElement) {
   if ("ScrollTimeline" in window) return;

   const scrollAnimation = element.getAnimations()[0];
   if (!scrollAnimation) return;
   scrollAnimation.pause();

   const scrollListener = () => {
      const { scrollLeft, scrollWidth, clientWidth } = element;
      const newTime =
         (scrollLeft / (scrollWidth - clientWidth)) * GESTURE_ANIMATION_MS;
      scrollAnimation.currentTime = newTime;
   };
   element.addEventListener("scroll", scrollListener, { passive: true });

   return () => {
      scrollAnimation.finish();
      element.removeEventListener("scroll", scrollListener);
   };
}

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
      const hasVerticalScroll =
         ["auto", "scroll"].includes(overflowY) &&
         current.scrollHeight > current.clientHeight;

      // If the element has vertical scroll capability and room to scroll down
      if (
         hasVerticalScroll &&
         current.scrollTop < current.scrollHeight - current.clientHeight
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
         document.body.scrollHeight - document.body.clientHeight
   ) {
      return document.body;
   }

   // No scrollable container found
   return null;
}
