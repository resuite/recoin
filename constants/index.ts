export const BASE_URL: string = import.meta.env.VITE_BASE_URL
export const PRE_RELEASE: string = import.meta.env.VITE_PRE_RELEASE
export const GOOGLE_CLIENT_ID: string = import.meta.env.VITE_GOOGLE_CLIENT_ID
export const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'
export const ROOT_APP_OUTLET = 'appOutlet'
export const ROOT_APP_OUTLET_ID = '#appOutlet'
export const SEARCH_BUFFER_TIMEOUT_MS = 400
export const TOAST_DEFAULT_DURATION = 1500
export const TRANSACTION_ITEM_HEIGHT =
   'calc(max(var(--text-normal) * 2, var(--spacing) * 2) + var(--spacing) * .75)'
export const SHEET_SIZING_ANIMATION_STYLES = {
   animationTimingFunction: 'ease',
   animationDuration: 'var(--sheet-sizing-speed)'
}
