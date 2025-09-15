import { Cell } from 'retend'
import { useDerivedValue } from 'retend-utils/hooks'
import type { JSX } from 'retend/jsx-runtime'

type OutputProps = JSX.IntrinsicElements['output']

interface FormattedMoneyProps extends OutputProps {
   value: JSX.ValueOrCell<number>
   currency: JSX.ValueOrCell<string>
}

export function FormattedMoney(props: FormattedMoneyProps) {
   const { value: valueProp, currency: currencyProp, ...rest } = props
   const value = useDerivedValue(valueProp)
   const currency = useDerivedValue(currencyProp)

   const formatter = Cell.source(
      new Intl.NumberFormat('en-US', {
         style: 'currency',
         currency: currency.get(),
         minimumFractionDigits: 2,
         currencyDisplay: 'narrowSymbol'
      })
   )

   const formattedValue = Cell.derived(() => {
      return formatter.get().format(value.get())
   })

   return <output {...rest}>{formattedValue}</output>
}
