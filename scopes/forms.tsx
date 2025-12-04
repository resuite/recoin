import { createScope } from 'retend'
import type { Form } from '@/utilities/form'

export interface TransactionDetailsForm {
   amount: number
   label: string
   date: Date
   time: string
   location: string
}

export const TransactionDetailsFormScope = createScope<Form<TransactionDetailsForm>>()
