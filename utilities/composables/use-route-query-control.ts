import { Cell } from 'retend'
import { useRouteQuery, useRouter } from 'retend/router'
import { defer } from '@/utilities/miscellaneous'

export function useRouteQueryControl(_key: string | { _root: string }, value = 'true') {
   const key = typeof _key === 'string' ? _key : _key._root
   const query = useRouteQuery()
   const router = useRouter()
   const current = router.getCurrentRoute()

   const add = () => {
      query.set(key, value)
   }
   const remove = (options: { subKeys?: boolean } = { subKeys: true }) => {
      query.delete(key)
      if (options.subKeys) {
         const subKeys = [...current.get().query.keys()].filter((_key) => {
            return _key.startsWith(`${key}.`)
         })
         defer(() => {
            // This tries to prevent any subtle timing/rendering issues
            // that can come from trying to remove all the keys at once.
            query.delete(...subKeys)
         })
      }
   }
   const hasKey = Cell.derived(() => {
      return current.get().query.get(key) === value
   })

   return { add, remove, hasKey }
}
