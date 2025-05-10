import { Icon, type PullState, PullZone } from "@recoin/components";
import { Cell, If } from "retend";

const PullZoneTest = () => {
   const state = Cell.source<PullState>("idle");
   const pullActive = Cell.derived(
      () => state.get() === "pulling" || state.get() === "thresholdreached",
   );
   const actionTriggered = Cell.derived(
      () => state.get() === "actiontriggered",
   );
   const topMarker = Cell.source<HTMLElement | null>(null);

   const FeedbackContent = () => {
      return (
         <div class="grid place-items-center place-content-center gap-0.5 h-full">
            <Icon
               name="loader"
               class={[
                  "w-1.5 h-1.5 duration-(--slow) transition-[translate,scale]",
                  {
                     "rotate-[calc(var(--pull-progress)*0.61deg)]": pullActive,
                     "scale-[calc(var(--pull-progress)*0.01)]": pullActive,
                     "opacity-[calc(var(--pull-progress)*0.005)]": pullActive,
                     "duration-0": pullActive,
                     "animate-spin!": actionTriggered,
                  },
               ]}
               style={{ animation: "none" }}
            />
            <div
               class={[
                  "text-center opacity-0 duration-(--slower) transition-opacity",
                  {
                     "opacity-75": actionTriggered,
                  },
               ]}
            >
               Refreshing data...
            </div>
         </div>
      );
   };

   return (
      <PullZone
         class="h-screen"
         feedback={FeedbackContent}
         onStateChange={(newState) => state.set(newState)}
         onActionTriggered={async () => {
            await new Promise((resolve) => setTimeout(resolve, 2000));
         }}
         content:class="rounded-t-2xl light-scheme rounded-t-3xl"
         contentTopMarker={topMarker}
      >
         <div class="min-h-[200dvh] text-big">
            <div ref={topMarker} class="h-0.25 w-full" />
            {state}
         </div>
      </PullZone>
   );
};

export default PullZoneTest;
