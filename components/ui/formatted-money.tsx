import { Cell } from 'retend'
import { useDerivedValue } from 'retend-utils/hooks'
import type { JSX } from 'retend/jsx-runtime'

type OutputProps = JSX.IntrinsicElements['output']

interface FormattedMoneyProps extends OutputProps {
   value: JSX.ValueOrCell<number>
   currency: string
}

export function FormattedMoney(props: FormattedMoneyProps) {
   const { value: valueProp, currency, ...rest } = props
   const value = useDerivedValue(valueProp)
   const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      currencyDisplay: 'narrowSymbol'
   })

   const formattedValue = Cell.derived(() => formatter.format(value.get()))

   return <output {...rest}>{formattedValue}</output>
}
