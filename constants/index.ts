export const BASE_URL: string = import.meta.env.VITE_BASE_URL
export const PRE_RELEASE: string = import.meta.env.VITE_PRE_RELEASE
export const GOOGLE_CLIENT_ID: string = import.meta.env.VITE_GOOGLE_CLIENT_ID
export const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'
export const ROOT_APP_OUTLET = 'appOutlet'
export const ROOT_APP_OUTLET_ID = '#appOutlet'
export const SEARCH_BUFFER_TIMEOUT_MS = 400
export const TOAST_DEFAULT_DURATION = 1500
export const TRANSACTION_ITEM_HEIGHT =
   'calc(max(var(--text-normal) * 2, (var(--spacing) * 2) + var(--spacing) * 0.75))'
export const Easing = {
   Timing: 'cubic-bezier(0.3, 0, 0.05, 1)',
   TimingKeyboard: 'cubic-bezier(0.17, 0.59, 0.4, 0.77)',
   TimingBounce: 'cubic-bezier(0.3, 0.75, 0.45, 1.2)',
   TimingBounceSlower: 'cubic-bezier(0.3, 0.47, 0, 1.35)'
}
const DefaultSpeed = 160
export const Speed = {
   Default: DefaultSpeed,
   Keyboard: DefaultSpeed * 0.75,
   Device: DefaultSpeed * 2.2,
   Faster: DefaultSpeed * 0.5,
   Fast: DefaultSpeed * 0.75,
   Slow: DefaultSpeed * 2,
   BitSlower: DefaultSpeed * 2.5,
   Slower: DefaultSpeed * 4.5,
   MuchSlower: DefaultSpeed * 6,
   Slowest: DefaultSpeed * 8
}
export const SHEET_SIZING_ANIMATION_STYLES = {
   animationTimingFunction: Easing.Timing,
   animationDuration: `${Speed.Device}ms`
}
