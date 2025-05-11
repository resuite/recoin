import { Cell, type SourceCell, useObserver } from "retend";
import type { JSX } from "retend/jsx-runtime";
import {
   getScrollableY,
   GESTURE_ANIMATION_MS,
   useIntersectionObserver,
} from "./utils";
import { useMatchMedia, useWindowSize } from "retend-utils/hooks";

export type PullState =
   | "thresholdreached"
   | "pulling"
   | "idle"
   | "actiontriggered";

type DivProps = JSX.IntrinsicElements["div"];
export interface PullZoneProps extends DivProps {
   /**
    * The content to be rendered in the feedback layer behind the scrollable content.
    */
   feedback?: () => JSX.Template;
   /**
    * A callback function that is invoked when the user completes a pull-down.
    * It is expected to return a Promise that resolves when a given action is complete.
    */
   onActionTriggered?: () => Promise<void>;
   /**
    * A callback function that is invoked when the state of the pull-zone changes.
    */
   onStateChange?: (state: PullState) => void;
   /**
    * A ref to the underlying HTML element of the pull zone.
    */
   ref?: SourceCell<HTMLElement | null>;
   /**
    * Classes to be applied to the content element.
    */
   "content:class"?: unknown;
   /**
    * A ref to a top marker in a scrollable content element.
    * This is used to determine when the pull-to-refresh can be triggered, which
    * will be when this marker is visible.
    */
   contentTopMarker?: SourceCell<HTMLElement | null>;
}

/**
 * Provides a "pull-to-refresh" or "pull-to-action" functionality.
 * It wraps content in a scrollable view. When the user pulls down from the top of this
 * content, a feedback area is revealed, and if pulled beyond a defined threshold,
 * an action is triggered.
 *
 * The component manages various states of the pull interaction, such as "pulling",
 * "thresholdreached", and "actiontriggered", and provides callbacks for these state changes.
 * It requires touch input (pointer: coarse) to enable the pull gesture.
 *
 * @param {PullZoneProps} props - The properties to configure the PullZone component.
 * @example
 * ```tsx
 * function App() {
 *   const handleRefresh = async () => {
 *     console.log("Refresh action triggered");
 *     await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate async action
 *     console.log("Refresh action complete");
 *   };
 *
 *   const handleStateChange = (state) => {
 *     console.log("PullZone state:", state);
 *   };
 *
 *   return (
 *     <PullZone
 *       onActionTriggered={handleRefresh}
 *       onStateChange={handleStateChange}
 *       feedback={() => <div style={{ padding: '20px', textAlign: 'center' }}>Pulling to refresh...</div>}
 *       style={{ height: '300px', border: '1px solid #ccc' }}
 *       content:class="my-custom-content-styles"
 *     >
 *       <div style={{ height: '200px', backgroundColor: '#ccc' }}>
 *         <p>Scrollable content goes here.</p>
 *         <p>Pull down to refresh.</p>
 *         {Array.from({ length: 20 }, (_, i) => <p key={i}>Item {i + 1}</p>)}
 *       </div>
 *     </PullZone>
 *   );
 * }
 * ```
 */
export function PullZone(props: PullZoneProps): JSX.Template {
   const {
      children,
      feedback,
      onActionTriggered,
      onStateChange,
      ref: pullZoneRef = Cell.source(null),
      "content:class": contentClasses,
      contentTopMarker: contentTopMarkerProp,
      ...rest
   } = props;
   const contentRef = Cell.source<HTMLElement | null>(null);
   const scrollContainerRef = Cell.source<HTMLElement | null>(null);
   const thresholdMarkerRef = Cell.source<HTMLElement | null>(null);
   const feedbackLayerRef = Cell.source<HTMLElement | null>(null);
   const contentTopMarkerRef =
      contentTopMarkerProp ?? Cell.source<HTMLElement | null>(null);
   const observer = useObserver();
   const supportsTouch = useMatchMedia("(pointer: coarse)");
   const { height } = useWindowSize();
   const reachedTop = Cell.source(false);
   const canPull = Cell.derived(() => reachedTop.get() && supportsTouch.get());
   let scrollable: HTMLElement | null = null;

   let pullState: PullState = "idle";
   let initialPointerY = 0;
   let feedbackLayerIsVisible = false;
   let thresholdMarkerIsVisible = false;
   let pullZoneHeight = 0;
   let pullScrollAnimation: Animation | null = null;

   const getPullZoneElement = () => {
      return pullZoneRef.peek() as HTMLElement;
   };

   const changeState = (newState: PullState) => {
      pullState = newState;
      onStateChange?.(pullState);
   };

   const handlePullRelease = async () => {
      const pullZone = getPullZoneElement();
      if (thresholdMarkerIsVisible) {
         changeState("actiontriggered");
         pullZone.classList.add("pull-zone-action-triggered");
         await onActionTriggered?.();
      }
      pullZone.classList.remove("pull-zone-action-triggered");
      changeState("idle");
   };

   const handlePointerDown = (event: PointerEvent) => {
      console.log(event);
      if (pullState === "actiontriggered") return;
      const pullZone = event.currentTarget as HTMLElement;
      const pointerOriginTarget = event.target as HTMLElement;
      scrollable = getScrollableY(pointerOriginTarget, pullZone);

      initialPointerY = event.clientY;

      pullZone.classList.add("pull-zone-dragging");
      pullZoneHeight = pullZone.clientHeight;

      pullScrollAnimation = pullZone.animate(KEYFRAMES, ANIMATION_OPTIONS);
      pullScrollAnimation.pause();

      window.addEventListener(
         "pointermove",
         handlePointerMove,
         LISTENER_OPTIONS,
      );
      window.addEventListener("pointerup", handlePointerUp);
      window.addEventListener("pointercancel", handlePointerUp);
   };

   const handlePointerMove = (event: PointerEvent) => {
      requestAnimationFrame(() => {
         const delta = event.clientY - initialPointerY;
         if (delta < 0) {
            if (!scrollable || delta > -30) return;
            scrollable.scrollTop = -delta;
            return;
         }

         if (pullScrollAnimation) {
            const newTime = (delta / pullZoneHeight) * GESTURE_ANIMATION_MS;
            pullScrollAnimation.currentTime = Math.min(
               newTime,
               MAX_PULL_ZONE_SCROLL_TOP,
            );
         }
      });
   };

   const handlePointerUp = () => {
      pullScrollAnimation?.play();
      pullScrollAnimation = null;
      scrollable = null;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      const pullZone = getPullZoneElement();
      pullZone.classList.remove("pull-zone-dragging");
      handlePullRelease();
   };

   // No, scrollend didn't work.
   //
   // CSS Scroll snaps have become untenable, so we have to
   // implement something a bit more manual. There are two
   // intersection observers, one tracking the feedback layer,
   // another tracking the threshold marker.
   //
   // - If the feedback layer is visible, but not the threshold marker,
   // it means the user is pulling. On touchend/scrollend we "snap" back to
   // the content.
   //
   // - If the threshold marker is visible, then we are ready for a pull
   // release and an action trigger. On touchend, we "snap" to
   // the feedback layer.
   useIntersectionObserver(
      thresholdMarkerRef,
      ([entry]) => {
         thresholdMarkerIsVisible = entry.isIntersecting;
         if (thresholdMarkerIsVisible) changeState("thresholdreached");
         else if (pullState !== "actiontriggered" && pullState !== "idle") {
            changeState("pulling");
         }
      },
      () => ({ root: pullZoneRef.peek(), threshold: 0.4 }),
   );

   useIntersectionObserver(
      feedbackLayerRef,
      ([entry]) => {
         feedbackLayerIsVisible = entry.isIntersecting;
         const thresholdMarker = thresholdMarkerRef.peek();
         if (!thresholdMarker) return;
         if (feedbackLayerIsVisible) changeState("pulling");
      },
      () => ({ root: pullZoneRef.peek(), threshold: 0.01 }),
   );

   // Another marker to indicate when pull-to-refresh can be used,
   // or if we should default to normal scroll.
   useIntersectionObserver(
      contentTopMarkerRef,
      ([entry]) => {
         // on startup, this will trigger canPull to be true,
         // and start the pull-to-refresh process.
         reachedTop.set(entry.isIntersecting);
      },
      () => ({ root: pullZoneRef.peek(), threshold: 0.9 }),
   );

   canPull.listen((canPull) => {
      const pullZone = getPullZoneElement();
      if (canPull) {
         pullZone?.addEventListener("pointerdown", handlePointerDown);
      } else {
         pullZone?.removeEventListener("pointerdown", handlePointerDown);
      }
   });

   height.listen(() => {
      // Prevents any funny behavior when the window resizes.
      const pullZone = getPullZoneElement();
      if (pullZone) {
         pullZone.scrollTop = pullZone.clientHeight;
      }
   });

   observer.onConnected(pullZoneRef, (pullZone) => {
      height; // Prevents GC until the pull-zone is unmounted.
      pullZone.scrollTop = pullZone.clientHeight;
   });

   return (
      <div
         {...rest}
         ref={pullZoneRef}
         class={["pull-zone", { "pull-zone-can-pull": canPull }, rest.class]}
      >
         <div ref={scrollContainerRef} class="pull-zone-scroll-container">
            <div ref={thresholdMarkerRef} class="pull-zone-threshold-marker" />
            <div ref={feedbackLayerRef} class="pull-zone-feedback-layer">
               {feedback?.()}
            </div>
            <div ref={contentRef} class={["pull-zone-content", contentClasses]}>
               {!contentTopMarkerProp ? (
                  <div
                     ref={contentTopMarkerRef}
                     class="pull-zone-content-top-marker"
                  />
               ) : null}
               {children}
            </div>
         </div>
      </div>
   );
}

const KEYFRAMES = [
   {
      "--pull-zone-scroll-top": 0,
   },
   {
      "--pull-zone-scroll-top": 100,
   },
];
const MAX_PULL_ZONE_SCROLL_TOP = (3500 / 135) * 10;

const ANIMATION_OPTIONS = { duration: 1000, easing: "linear" };
const LISTENER_OPTIONS = { passive: true };
