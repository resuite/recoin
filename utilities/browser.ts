import Bowser from 'bowser';

export const Browsers = {
   Safari: 'Safari',
   Chrome: 'Chrome',
   Firefox: 'Firefox',
   Edge: 'Edge',
};

export function currentBrowser() {
   return Bowser.getParser(window.navigator.userAgent);
}
