import type { IconName } from '@/components/icons'

export interface Category {
   name: string
   icon: IconName
   key: string
}

export const defaultExpenseCategories: Category[] = [
   { name: 'Utilities', icon: 'house', key: 'utilities' },
   { name: 'Food and Drinks', icon: 'cutlery', key: 'food-and-drinks' },
   { name: 'Transportation', icon: 'car', key: 'transportation' },
   { name: 'Health and Personal Care', icon: 'healthcare', key: 'health-and-personal-care' },
   { name: 'Financial Obligation', icon: 'credit-card', key: 'financial-obligation' },
   { name: 'Shopping and Entertainment', icon: 'purse', key: 'shopping-and-entertainment' }
]

export const defaultIncomeCategories: Category[] = [
   { name: 'Salary and Wages', icon: 'suitcase', key: 'salary-and-wages' },
   { name: 'Freelance and Contracts', icon: 'paper', key: 'freelance-and-contracts' },
   { name: 'Dividends', icon: 'dollar', key: 'dividends' },
   { name: 'Gifts', icon: 'gift', key: 'gifts' },
   { name: 'Benefits', icon: 'diamond', key: 'benefits' },
   { name: 'Sales', icon: 'cart', key: 'sales' }
]

export const defaultCurrency = 'NGN'
