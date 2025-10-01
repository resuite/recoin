import { getCurrencyDecimals } from '@/utilities/money'
import { Cell } from 'retend'
import { useDerivedValue } from 'retend-utils/hooks'
import type { JSX } from 'retend/jsx-runtime'

type OutputProps = JSX.IntrinsicElements['output']

interface FormattedMoneyProps extends OutputProps {
   children: JSX.ValueOrCell<number | string>
   currency: JSX.ValueOrCell<string>
   minimumFractionDigits?: JSX.ValueOrCell<number>
   showCurrencySymbol?: JSX.ValueOrCell<boolean>
}

export function FormattedMoney(props: FormattedMoneyProps) {
   const {
      children: valueProp,
      currency: currencyProp,
      minimumFractionDigits: minimumFractionDigitsProp = 2,
      showCurrencySymbol: showCurrencySymbolProp = true,
      ...rest
   } = props
   const value = useDerivedValue(valueProp)
   const currency = useDerivedValue(currencyProp)
   const minimumFractionDigits = useDerivedValue(minimumFractionDigitsProp)
   const showCurrencySymbol = useDerivedValue(showCurrencySymbolProp)
   const currencyDecimals = Cell.derived(() => {
      return getCurrencyDecimals(currency.get())
   })

   const formatter = Cell.derived(() => {
      const options: Intl.NumberFormatOptions = showCurrencySymbol.get()
         ? {
              minimumFractionDigits: minimumFractionDigits.get(),
              style: 'currency',
              currency: currency.get(),
              currencyDisplay: 'narrowSymbol'
           }
         : {
              minimumFractionDigits: minimumFractionDigits.get()
           }
      return new Intl.NumberFormat('en-US', options)
   })

   const formattedValue = Cell.derived(() => {
      return formatter.get().format(Number(value.get()) / 10 ** currencyDecimals.get())
   })

   return <output {...rest}>{formattedValue}</output>
}
