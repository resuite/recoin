const Runtime = {
   Supports: {
      AnchorPositioning: false,
      ContextMenuEvent: false,
      ScrollEndEvent: false,
      ScrollTimeline: false,
      ScrollStateQueries: false,
      CSSTypedOM: false,
      VirtualKeyboardApi: false
   }
}

function updateFlags() {
   Runtime.Supports = {
      AnchorPositioning: CSS.supports('anchor-name: --name'),
      // Safari again. The contextmenu event never fires on iOS, even though:
      // - it is supported on mac versions
      // - it is defined in Element.oncontextmenu
      // Some old bug they just never got around to, surely.
      ContextMenuEvent: 'GestureEvent' in window,
      ScrollEndEvent: 'onscrollend' in window,
      ScrollTimeline: 'ScrollTimeline' in window,
      // Container scroll queries are supported in Chromium,
      // They allow a very useful optimization for sticky elements,
      // but the syntax breaks the lightningcss parser used
      // in Tailwind and the Biome CSS parser.
      ScrollStateQueries: CSS.supports('container-type', 'scroll-state') && false,
      CSSTypedOM: window.CSS && 'number' in CSS,
      VirtualKeyboardApi: 'virtualKeyboard' in navigator
   }
}

const isClient = typeof window !== 'undefined' && window.document
if (isClient) {
   updateFlags()
}

export const Flags = { Runtime }
