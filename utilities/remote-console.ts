// biome-ignore-all lint/suspicious/noConsole: sorta the point.

import { LocalStorageKeys } from '@/constants/local-storage-keys'

const DEVICE_ID_KEY = LocalStorageKeys.DeviceId
const REMOTE_CONSOLE_ENABLED_KEY = LocalStorageKeys.RemoteConsoleEnabled

let isPatched = false
const originalMethods = {
   log: console.log,
   warn: console.warn,
   error: console.error,
   info: console.info,
   debug: console.debug
}

/**
 * Gets or creates a unique device identifier.
 * The ID is persisted in localStorage across sessions.
 */
export function getDeviceId(): string {
   if (typeof window === 'undefined') {
      return 'server'
   }
   let deviceId = localStorage.getItem(DEVICE_ID_KEY)
   if (!deviceId) {
      // Generate a short, readable device ID
      const adjectives = ['swift', 'bright', 'calm', 'bold', 'cool', 'keen', 'warm', 'fair']
      const nouns = ['fox', 'owl', 'bear', 'hawk', 'wolf', 'deer', 'lion', 'puma']
      const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
      const noun = nouns[Math.floor(Math.random() * nouns.length)]
      const suffix = Math.random().toString(36).substring(2, 6)
      deviceId = `${adjective}-${noun}-${suffix}`
      localStorage.setItem(DEVICE_ID_KEY, deviceId)
   }
   return deviceId
}

/**
 * Checks if remote console logging is currently enabled.
 */
export function isRemoteConsoleEnabled(): boolean {
   if (typeof window === 'undefined') {
      return false
   }
   try {
      return JSON.parse(localStorage.getItem(REMOTE_CONSOLE_ENABLED_KEY) ?? 'false') === true
   } catch {
      return false
   }
}

/**
 * Strips browser console formatting codes (%c) and their style arguments.
 * Console.log('%cHello', 'color:red') becomes just 'Hello'
 */
function stripConsoleFormatting(args: Array<unknown>): Array<unknown> {
   const result: Array<unknown> = []
   let skipNext = 0

   for (let i = 0; i < args.length; i++) {
      if (skipNext > 0) {
         skipNext--
         continue
      }

      const arg = args[i]
      if (typeof arg === 'string') {
         // Count %c occurrences to know how many style args to skip
         const matches = arg.match(/%c/g)
         if (matches) {
            skipNext = matches.length
            // Remove %c from the string
            result.push(arg.replace(/%c/g, ''))
         } else {
            result.push(arg)
         }
      } else {
         result.push(arg)
      }
   }

   return result
}

/**
 * Serializes arguments for transmission to the server.
 */
function serializeArgs(args: Array<unknown>): Array<string> {
   const cleanedArgs = stripConsoleFormatting(args)

   return cleanedArgs.map((arg) => {
      if (arg === undefined) {
         return 'undefined'
      }
      if (arg === null) {
         return 'null'
      }
      if (typeof arg === 'function') {
         return `[Function: ${arg.name || 'anonymous'}]`
      }
      if (arg instanceof Error) {
         return `${arg.name}: ${arg.message}\n${arg.stack || ''}`
      }
      if (typeof arg === 'object') {
         try {
            return JSON.stringify(arg, null, 2)
         } catch {
            return String(arg)
         }
      }
      return String(arg)
   })
}

/**
 * Sends a log message to the server.
 */
async function sendLogToServer(
   level: keyof typeof originalMethods,
   args: Array<unknown>
): Promise<void> {
   const deviceId = getDeviceId()
   const serializedArgs = serializeArgs(args)

   try {
      await fetch('/__api/debug/console', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            deviceId,
            level,
            args: serializedArgs,
            timestamp: new Date().toISOString()
         })
      })
   } catch {
      // Silently fail - we don't want to cause infinite loops
      // by logging errors about logging
   }
}

/**
 * Patches the console methods to forward logs to the server.
 */
function patchConsole(): void {
   if (isPatched) {
      return
   }

   for (const level of Object.keys(originalMethods) as Array<keyof typeof originalMethods>) {
      console[level] = (...args: Array<unknown>) => {
         // Always call the original method first
         originalMethods[level].apply(console, args)

         // Send to server if enabled
         if (isRemoteConsoleEnabled()) {
            sendLogToServer(level, args)
         }
      }
   }
   isPatched = true
}

/**
 * Initializes the remote console system.
 * Should be called early in the application lifecycle.
 */
export function initRemoteConsole(): void {
   // Always patch console so toggling works without page reload
   patchConsole()

   // Log initial status if enabled
   if (isRemoteConsoleEnabled()) {
      console.info(`[Remote Console] Device ID: ${getDeviceId()}`)
   }
}
