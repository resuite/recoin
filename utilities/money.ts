export function getCurrencyDecimals(currency: string) {
   return (
      new Intl.NumberFormat('en-US', {
         style: 'currency',
         currency,
         minimumFractionDigits: 0
      }).resolvedOptions().maximumFractionDigits || 2
   )
}
