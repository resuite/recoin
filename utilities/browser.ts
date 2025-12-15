import Bowser from 'bowser'

export const Browsers = {
   Safari: 'Safari',
   Chrome: 'Chrome',
   Firefox: 'Firefox',
   Edge: 'Edge'
}

export const Platform = {
   Android: 'Android',
   iOS: 'iOS',
   Windows: 'Windows',
   MacOS: 'macOS',
   Linux: 'Linux',
   Unknown: 'Unknown'
}

export function currentBrowser() {
   return Bowser.getParser(window.navigator.userAgent)
}
