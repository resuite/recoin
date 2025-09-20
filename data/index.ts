import type { IconName } from '@/components/icons'
import { Cell } from 'retend'

interface Model {
   id: `${string}_${string}`
}

type Id<T extends string> = `${T}_${string}`
type Ref<M extends Model> = M['id']
type TransactionType = 'income' | 'expense'

export interface Category extends Model {
   id: Id<'category'>
   name: string
   icon: IconName
}

export interface Currency extends Model {
   id: Id<'currency'>
   value: string
}

export interface Transaction extends Model {
   id: Id<'transaction'>
   currency: Ref<Currency>
   type: TransactionType
   category: Ref<Category>
   label: string
   amount: number
}

export const defaultExpenseCategories: Category[] = [
   {
      id: 'category_utilities',
      name: 'Utilities',
      icon: 'house'
   },
   {
      id: 'category_food-and-drinks',
      name: 'Food and Drinks',
      icon: 'cutlery'
   },
   {
      id: 'category_transportation',
      name: 'Transportation',
      icon: 'car'
   },
   {
      id: 'category_health-and-personal-care',
      name: 'Health and Personal Care',
      icon: 'healthcare'
   },
   {
      id: 'category_financial-obligation',
      name: 'Financial Obligation',
      icon: 'credit-card'
   },
   {
      id: 'category_shopping-and-entertainment',
      name: 'Shopping and Entertainment',
      icon: 'purse'
   }
]

export const defaultIncomeCategories: Category[] = [
   {
      id: 'category_salary-and-wages',
      name: 'Salary and Wages',
      icon: 'suitcase'
   },
   {
      id: 'category_freelance-and-contracts',
      name: 'Freelance and Contracts',
      icon: 'paper'
   },
   {
      id: 'category_dividends',
      name: 'Dividends',
      icon: 'dollar'
   },
   {
      id: 'category_gifts',
      name: 'Gifts',
      icon: 'gift'
   },
   {
      id: 'category_benefits',
      name: 'Benefits',
      icon: 'diamond'
   },
   {
      id: 'category_sales',
      name: 'Sales',
      icon: 'cart'
   }
]

export const defaultCurrency: Currency = {
   id: 'currency_ngn',
   value: 'NGN'
}

export const defaultTransactionListing: Cell<Transaction[]> = Cell.source([
   {
      id: 'transaction_1',
      currency: 'currency_ngn',
      type: 'expense',
      category: 'category_food-and-drinks',
      label: 'Groceries',
      amount: 5000
   },
   {
      id: 'transaction_2',
      currency: 'currency_ngn',
      type: 'expense',
      category: 'category_transportation',
      label: 'Fuel',
      amount: 7500
   },
   {
      id: 'transaction_3',
      currency: 'currency_ngn',
      type: 'expense',
      category: 'category_utilities',
      label: 'Electricity Bill',
      amount: 12000
   },
   {
      id: 'transaction_4',
      currency: 'currency_ngn',
      type: 'income',
      category: 'category_salary-and-wages',
      label: 'Monthly Salary',
      amount: 250000
   },
   {
      id: 'transaction_5',
      currency: 'currency_ngn',
      type: 'expense',
      category: 'category_shopping-and-entertainment',
      label: 'Movie Ticket',
      amount: 3000
   },
   {
      id: 'transaction_6',
      currency: 'currency_ngn',
      type: 'expense',
      category: 'category_health-and-personal-care',
      label: 'Pharmacy',
      amount: 4000
   },
   {
      id: 'transaction_7',
      currency: 'currency_ngn',
      type: 'income',
      category: 'category_freelance-and-contracts',
      label: 'Project Payment',
      amount: 80000
   },
   {
      id: 'transaction_8',
      currency: 'currency_ngn',
      type: 'expense',
      category: 'category_food-and-drinks',
      label: 'Lunch Out',
      amount: 6000
   },
   {
      id: 'transaction_9',
      currency: 'currency_ngn',
      type: 'expense',
      category: 'category_financial-obligation',
      label: 'Loan Repayment',
      amount: 15000
   },
   {
      id: 'transaction_10',
      currency: 'currency_ngn',
      type: 'income',
      category: 'category_gifts',
      label: 'Birthday Gift',
      amount: 10000
   },
   {
      id: 'transaction_11',
      currency: 'currency_ngn',
      type: 'expense',
      category: 'category_shopping-and-entertainment',
      label: 'New Gadget',
      amount: 75000
   },
   {
      id: 'transaction_12',
      currency: 'currency_ngn',
      type: 'income',
      category: 'category_sales',
      label: 'Sold Item Online',
      amount: 20078
   },
   {
      id: 'transaction_13',
      currency: 'currency_ngn',
      type: 'expense',
      category: 'category_utilities',
      label: 'Internet Bill',
      amount: 8000
   },
   {
      id: 'transaction_14',
      currency: 'currency_ngn',
      type: 'income',
      category: 'category_dividends',
      label: 'Stock Dividends',
      amount: 15000
   }
])

export const startingBalance = Cell.source(0)

export const derivedExpense = Cell.derived(() => {
   const listing = defaultTransactionListing.get()
   return listing.reduce((acc, transaction) => {
      if (transaction.type === 'expense') {
         return acc + transaction.amount
      }
      return acc
   }, 0)
})

export const derivedIncome = Cell.derived(() => {
   const listing = defaultTransactionListing.get()
   return listing.reduce((acc, transaction) => {
      if (transaction.type === 'income') {
         return acc + transaction.amount
      }
      return acc
   }, 0)
})

export const currentBalance = Cell.derived(() => {
   return startingBalance.get() + derivedIncome.get() - derivedExpense.get()
})
