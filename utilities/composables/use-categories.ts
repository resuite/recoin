import type { TransactionType } from '@/api/database/types'
import CategoryModel, { type Category } from '@/data/livestore/models/category'
import { useAuthContext } from '@/scopes/auth'
import { useLiveQuery } from '@/scopes/livestore'
import { Cell } from 'retend'

export function useCategories(type: TransactionType): Cell<Array<Category>> {
   const { userData } = useAuthContext()
   const workspaceId = userData.get()?.workspaces[0]?.id
   const getCategoriesQuery = CategoryModel.table
      .where({ workspaceId, type })
      .orderBy('name', 'asc')
   const categories = useLiveQuery(getCategoriesQuery)
   return categories as Cell<Array<Category>>
}

export function useCategory(id: string | null): Cell<Category | null> {
   if (!id) {
      return Cell.source(null)
   }
   const getCategoryQuery = CategoryModel.table.where({ id })
   const results = useLiveQuery(getCategoryQuery)

   return Cell.derived(() => {
      return results.get().at(1) ?? null
   })
}

export function useIncomeCategories() {
   return useCategories('income')
}

export function useExpenseCategories() {
   return useCategories('expense')
}
