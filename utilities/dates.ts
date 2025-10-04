const pr = new Intl.PluralRules('en-US', { type: 'ordinal' })

const suffixes = new Map([
   ['one', 'st'],
   ['two', 'nd'],
   ['few', 'rd'],
   ['other', 'th']
])

export function ordinal(n: number) {
   const rule = pr.select(n)
   const suffix = suffixes.get(rule)
   return `${n}${suffix}`
}

export function formatTime(date: Date) {
   return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
   })
}

export function formatRelativeDate(date: Date) {
   const now = new Date()
   const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
   const diffInDays = Math.floor(diffInSeconds / 86400)

   if (diffInDays < 30) {
      const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

      if (diffInDays < 1) {
         const hours = Math.floor(diffInSeconds / 3600)
         if (hours >= 1) {
            return rtf.format(-hours, 'hour')
         }

         const minutes = Math.floor(diffInSeconds / 60)
         if (minutes >= 1) {
            return rtf.format(-minutes, 'minute')
         }

         return rtf.format(0, 'second')
      }

      if (diffInDays < 7) {
         return `${rtf.format(-diffInDays, 'day')} at ${formatTime(date)}`
      }

      const weeks = Math.floor(diffInDays / 7)
      return `${rtf.format(-weeks, 'week')} at ${formatTime(date)}`
   }

   const day = ordinal(date.getDate())
   const month = date.toLocaleDateString('en-GB', { month: 'long' })
   const year = date.getFullYear()
   const time = formatTime(date)

   return `${day} ${month}, ${year}, ${time}`
}
