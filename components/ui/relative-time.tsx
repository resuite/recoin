import { formatRelativeDate } from '@/utilities/dates'
import { Cell } from 'retend'
import { useDerivedValue, useLiveDate } from 'retend-utils/hooks'
import type { JSX } from 'retend/jsx-runtime'

type TimeProps = JSX.IntrinsicElements['time']
interface RelativeTimeProps extends TimeProps {
   date: JSX.ValueOrCell<Date>
}

export function RelativeTime(props: RelativeTimeProps) {
   const { date: dateProp, ...rest } = props
   const date = useDerivedValue(dateProp)
   const dateInISOString = Cell.derived(() => {
      return date.get().toISOString()
   })
   const liveDate = useLiveDate(30000) // Update every 30 seconds

   const formattedDate = Cell.derived(() => {
      liveDate.get() // register a dependency on the liveDate
      return formatRelativeDate(date.get())
   })

   return (
      <time {...rest} dateTime={dateInISOString}>
         {formattedDate}
      </time>
   )
}
