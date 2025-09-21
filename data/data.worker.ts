import type { Category, Transaction } from '@/api/database/types'
import {
   type DbWorkerKey,
   type DbWorkerResponseMap as DbWorkerMessageMap,
   DbWorkerMessages,
   type WorkerRequest
} from '@/data/shared'
import { type SerializableValue, createChannel } from 'bidc'

const defaultExpenseCategories: Category[] = [
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

const defaultIncomeCategories: Category[] = [
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

const defaultTransactionListing: Transaction[] = [
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
]

const startingBalance = 0

const responseMap: DbWorkerMessageMap = {
   [DbWorkerMessages.GetIncomeCategories]: () => {
      return Promise.resolve(defaultIncomeCategories)
   },
   [DbWorkerMessages.GetExpenseCategories]: () => {
      return Promise.resolve(defaultExpenseCategories)
   },
   [DbWorkerMessages.GetCategoryById]: (id) => {
      return new Promise((resolve) => {
         for (const category of defaultExpenseCategories) {
            if (category.id === id) {
               return resolve(category)
            }
         }
         for (const category of defaultIncomeCategories) {
            if (category.id === id) {
               return resolve(category)
            }
         }
         return resolve(null)
      })
   },
   [DbWorkerMessages.GetHomeStats]: () => {
      return new Promise((resolve) => {
         const totalExpense = defaultTransactionListing.reduce((acc, transaction) => {
            if (transaction.type === 'expense') {
               return acc + transaction.amount
            }
            return acc
         }, 0)
         const totalIncome = defaultTransactionListing.reduce((acc, transaction) => {
            if (transaction.type === 'income') {
               return acc + transaction.amount
            }
            return acc
         }, 0)

         return resolve({ startingBalance, totalExpense, totalIncome })
      })
   }
}

const { receive } = createChannel()
receive((payload) => {
   const _payload = payload as unknown as WorkerRequest<DbWorkerMessageMap, DbWorkerKey>
   const handler = responseMap[_payload.key] as unknown as (input: unknown) => SerializableValue
   return handler(_payload.payload)
})
