import { type SourceCell, createScope } from 'retend'

export interface NewTransactionDetails {
   amount: SourceCell<number>
   label: SourceCell<string>
}

export const NewTransactionDetailsScope = createScope<NewTransactionDetails>()
