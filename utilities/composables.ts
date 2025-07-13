import { useRouteQuery } from 'retend/router'

export function useRouteQueryControl(key: string, value = 'true') {
   const query = useRouteQuery()
   const add = () => {
      query.set(key, value)
   }
   const remove = () => {
      query.delete(key)
   }
   const hasKey = query.has(key)

   return { add, remove, hasKey }
}
