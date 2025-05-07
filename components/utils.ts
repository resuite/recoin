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

export const defer = (fn: () => void) => setTimeout(fn, 0);
