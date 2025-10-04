import type { Category } from '@/database/models/category'

export const DEFAULT_EXPENSE_CATEGORIES: Array<Omit<Category, 'workspaceId'>> = [
   {
      id: '439be2cc-4f6b-493a-90bc-9991a15c5b26',
      name: 'Utilities',
      icon: 'house',
      type: 'expense'
   },
   {
      id: '6dae7cb9-14b6-4265-96e5-570c91ed9383',
      name: 'Food and Drinks',
      icon: 'cutlery',
      type: 'expense'
   },
   {
      id: '87ddb9ae-a0d6-4bac-aa21-3d044f82c03f',
      name: 'Transportation',
      icon: 'car',
      type: 'expense'
   },
   {
      id: '92dcd0c3-04bc-4148-ad5d-4cda5dfa1446',
      name: 'Health and Personal Care',
      icon: 'healthcare',
      type: 'expense'
   },
   {
      id: '9682e153-5118-4c8a-b5d6-cd447ec2fe93',
      name: 'Financial Obligation',
      icon: 'credit-card',
      type: 'expense'
   },
   {
      id: '832b4f7f-fdec-4071-830c-83741cfa8759',
      name: 'Shopping and Entertainment',
      icon: 'purse',
      type: 'expense'
   }
]

export const DEFAULT_INCOME_CATEGORIES: Array<Omit<Category, 'workspaceId'>> = [
   {
      id: 'c36c569b-5b1a-4cc3-87a4-7e192a428c9a',
      name: 'Salary and Wages',
      icon: 'suitcase',
      type: 'income'
   },
   {
      id: '88031338-3453-4d4d-ada2-45c21495993f',
      name: 'Freelance and Contracts',
      icon: 'paper',
      type: 'income'
   },
   {
      id: 'c6c08ba0-244b-4a8a-90ee-a26192abd65f',
      name: 'Dividends',
      icon: 'dollar',
      type: 'income'
   },
   {
      id: 'a746c88e-0038-4a9e-9fc5-937ec8ae7af0',
      name: 'Gifts',
      icon: 'gift',
      type: 'income'
   },
   {
      id: 'ebae3d38-9614-4f6a-90e1-a6d1ce20e8be',
      name: 'Benefits',
      icon: 'diamond',
      type: 'income'
   },
   {
      id: '29fa599b-db0a-4552-b816-cbbefb7daea3',
      name: 'Sales',
      icon: 'cart',
      type: 'income'
   }
]
