export class PointerTracker extends EventTarget {
   startingEvent!: PointerEvent;

   constructor() {
      super();
      this.move = this.move.bind(this);
      this.end = this.end.bind(this);
      this.cancel = this.cancel.bind(this);
   }

   start(event: PointerEvent) {
      this.startingEvent = event;

      window.addEventListener('pointermove', this.move, { passive: true });
      window.addEventListener('pointerup', this.end);
      window.addEventListener('pointercancel', this.cancel);
   }

   addEventListener<T extends keyof GestureTrackerEventMap>(
      type: T,
      listener: EventHandler<GestureTrackerEventMap[T]>,
      options?: boolean | AddEventListenerOptions | undefined,
   ) {
      // @ts-expect-error
      super.addEventListener(type, listener, options);
   }

   removeEventListener<T extends keyof GestureTrackerEventMap>(
      type: T,
      listener: EventHandler<GestureTrackerEventMap[T]>,
      options?: EventListenerOptions | undefined,
   ) {
      // @ts-expect-error
      super.removeEventListener(type, listener, options);
   }

   private move(event: PointerEvent) {
      const deltaX = event.clientX - this.startingEvent.clientX;
      const deltaY = event.clientY - this.startingEvent.clientY;
      const moveEvent = new TrackedMoveEvent(deltaX, deltaY, event);
      this.dispatchEvent(moveEvent);
   }

   end() {
      this.dispatchEvent(new Event('end'));
      this.removeListeners();
   }

   cancel() {
      this.dispatchEvent(new Event('cancel'));
      this.removeListeners();
   }

   removeListeners() {
      window.removeEventListener('pointermove', this.move);
      window.removeEventListener('pointerup', this.end);
      window.removeEventListener('pointercancel', this.cancel);
   }
}

interface GestureTrackerEventMap {
   move: TrackedMoveEvent;
   end: Event;
   cancel: Event;
}

type EventHandler<T extends Event> =
   | null
   | ((event: T) => void)
   | EventListenerObject<T>;

export class TrackedMoveEvent extends Event {
   deltaX: number;
   deltaY: number;
   originEvent: PointerEvent;

   constructor(deltaX: number, deltaY: number, originEvent: PointerEvent) {
      super('move');
      this.deltaX = deltaX;
      this.deltaY = deltaY;
      this.originEvent = originEvent;
   }
}
