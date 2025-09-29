import { defer } from '@/utilities/miscellaneous'
import { useRouteQuery, useRouter } from 'retend/router'

export function useRouteQueryControl(_key: string | { _root: string }, value = 'true') {
   const key = typeof _key === 'string' ? _key : _key._root
   const query = useRouteQuery()
   const router = useRouter()
   const current = router.getCurrentRoute()

   const add = () => {
      query.set(key, value)
   }
   const remove = () => {
      const subKeys = [...current.get().query.keys()].filter((_key) => {
         return _key.startsWith(`${key}.`)
      })
      query.delete(key)
      defer(() => {
         // This tries to prevent any subtle timing/rendering issues
         // that can come from trying to remove all the keys at once.
         query.delete(...subKeys)
      })
   }
   const hasKey = query.has(key)

   return { add, remove, hasKey }
}
